export interface InputOptions {
  accept: string[];
  multiple: boolean;
  webkitdirectory: boolean;
  filtration: boolean | string[];
}

function handleFile(files: FileList): File[] {
  const target: File[] = [];
  for (let i = files.length - 1; i >= 0; i--) {
    target.push(files.item(i) as File);
  }
  return target;
}

export function createInput(opt?: Partial<InputOptions>) {
  const accept = opt?.accept?.map(v => v.toLocaleLowerCase()) || [];
  return new Promise<File[]>((success, reject) => {
    const dom = document.createElement('input');
    dom.accept = (accept => accept ? '.' + accept : '')(accept.join(',.'));
    dom.webkitdirectory = opt?.webkitdirectory || false;
    dom.multiple = opt?.multiple || false;
    dom.type = 'file';
    dom.onchange = function() {
      const files = handleFile(dom.files as FileList);
      // // 未选择文件夹，选中的文件加入验证
      if (accept.length > 0) {
        const reg = new RegExp(`\\.(${accept.join('|')})$`, 'i');
        // 验证格式是否与传入一致 - 过滤，还是报错
        for (let key = files.length - 1; key >= 0; key--) {
          const FileName = files[key].name;
          if (!reg.test(FileName)) {
            const path = (files[key] as any).path;
            const errMeg = `path:${path} 与传入的格式不一致。`;
            if (opt?.filtration) {
              if (Array.isArray(opt.filtration)) {
                const ext = (FileName.split('.').pop() || '').toLocaleLowerCase();
                const filtration = opt.filtration.map(v => v.toLocaleLowerCase());
                if (filtration.includes(ext)) reject(new Error(`<div style="line-height: 1.4em"><h3 style="text-align: center;">格式错误</h3><div>限制文件格式：【 ${filtration.join(', ')} 】， ${path}</div></div>`));
              }
              // && opt.filtration.map(v => v.toLocaleLowerCase()).includes(ext.toLocaleLowerCase())
              //
              console.error(errMeg);
              files.splice(key, 1); // 删除文件
            } else {
              reject(new Error(errMeg));
            }
          }
        }
      }
      success(files);
      dom.remove(); // 移除
    };
    dom.onblur = function() {
      console.log(dom.files);
    };
    dom.click(); // 激活
  });
}

export function getFile(accept?: string[], multiple?: boolean, filtration: string[] | boolean = true) {
  return createInput({ accept, multiple, filtration });
}

export function getFolder(accept?: string[], multiple?: boolean, filtration: string[] | boolean = true) {
  return createInput({ accept, multiple, filtration, webkitdirectory: true });
}

export async function getDragFile({ dataTransfer }: { dataTransfer: DataTransfer }): Promise<File[]> {
  const items = dataTransfer.items;
  const files: File[] = [];

  // 递归读取目录
  const processEntry = async (entry: FileSystemEntry, path = '') => {
    if (entry.isFile) {
      // 处理文件
      const file = await new Promise<File>((resolve) => {
        (entry as FileSystemFileEntry).file(resolve);
      });
      // 保留相对路径信息
      if (path) {
        Object.defineProperty(file, 'webkitRelativePath', {
          value: path + file.name,
        });
      }
      files.push(file);
    } else if (entry.isDirectory) {
      // 处理目录
      const dirReader = (entry as FileSystemDirectoryEntry).createReader();
      const subEntries = await new Promise<FileSystemEntry[]>((resolve, reject) => {
        const entries: FileSystemEntry[] = [];
        const readNextBatch = () => {
          dirReader.readEntries((batch) => {
            if (batch.length > 0) {
              entries.push(...batch);
              readNextBatch(); // 继续读取下一批次
            } else {
              resolve(entries); // 读取完成
            }
          }, reject);
        };
        readNextBatch();
      });

      // 递归处理子项
      const newPath = `${path}${entry.name}/`;
      await Promise.all(
        subEntries.map((subEntry) => processEntry(subEntry, newPath)),
      );
    }
  };

  // 遍历所有拖拽项
  const entries: FileSystemEntry[] = [];
  for (let i = 0; i < items.length; i++) {
    const entry = items[i].webkitGetAsEntry?.() || null;
    if (entry) entries.push(entry);
  }

  // 并行处理所有条目
  await Promise.all(entries.map((entry) => processEntry(entry)));
  return files;
}

// export function getDragFile({dataTransfer}: { dataTransfer: DataTransfer }): Array<File> {
//   const items = dataTransfer.items;
//   const files: File[] = [];
//
//   function traverseFileTree(item: any, path?: string) {
//     path = path || '';
//     if (item.isFile) {
//       item.file(function (file: File) {
//         files.push(file);
//       });
//     } else if (item.isDirectory) {
//       const directoryReader = item.createReader();
//       directoryReader.readEntries(function (entries: string | any[]) {
//         for (let i = 0; i < entries.length; i++) {
//           traverseFileTree(entries[i], path + item.name + '/');
//         }
//       });
//     }
//   }
//
//   for (let i = 0; i < items.length; i++) {
//     const item = items[i].webkitGetAsEntry();
//     if (item) traverseFileTree(item);
//   }
//
//   return files;
// }

export function FileToBase64(file: File): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = function() {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

export function base64ToFile(filename: string, base64: string): File {
  const [_, mimeType, string] = base64.match(/^data:([^;]+);base64,(.+)$/) as string[];
  const value = atob(string);
  const buffer = new Uint8Array(value.length);
  for (let i = 0, len = value.length; i < len; i++) {
    buffer[i] = value.charCodeAt(i);
  }
  return new File([buffer], filename, { type: mimeType });
}

export function toImage(value: File | string): Promise<HTMLImageElement> {
  const image = new Image();
  return new Promise(async (resolve, reject) => {
    image.onload = function() {
      resolve(image);
    };
    image.onerror = function() {
      reject(new Error('Failed to load image'));
    };
    image.src = typeof value === 'string' ? value : await FileToBase64(value);
  });
}

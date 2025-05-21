interface PackingOptions {
  spacing: number,
  maxWidth: number,
}

export interface ImageInfo {
  url: string,
  top: number;
  left: number;
  width: number,
  height: number
  img: HTMLImageElement;
  node?: BinNode;
}

export interface BinNode {
  x: number;
  y: number;
  width: number;
  height: number;
  used?: boolean;
  down?: BinNode;
  right?: BinNode;
}

function packing(imagesInfo: Array<ImageInfo>, {spacing, maxWidth}: PackingOptions): Array<ImageInfo> {
  // 1. 对图像按照高度（或面积）排序，从大到小可以减少碎片
  imagesInfo = imagesInfo.sort((a, b) => {
    return (b.height * b.width) - (a.height * a.width);
  });
  // 2. 初始化根节点（容器）
  let root: BinNode = {x: 0, y: 0, width: maxWidth, height: imagesInfo[0].height};
  for (let image of imagesInfo) {
    const node = findNode(root, image.width + spacing, image.height + spacing);
    if (node) {
      image.node = splitNode(node, image.width + spacing, image.height + spacing);
    } else {
      // 扩展容器（向下扩展）
      root = growDown(root, image.height + spacing);
      image.node = splitNode(findNode(root, image.width + spacing, image.height + spacing)!, image.width + spacing, image.height + spacing);
    }
    image.left = image.node.x;
    image.top = image.node.y;
  }
  return imagesInfo;
}

// 找到可以放置图像的节点
function findNode(root: BinNode, width: number, height: number): BinNode | null {
  if (root.used) {
    return findNode(root.right!, width, height) || findNode(root.down!, width, height);
  } else if (width <= root.width && height <= root.height) {
    return root;
  } else {
    return null;
  }
}

// 占用节点，并拆分出右侧和下方的空间
function splitNode(node: BinNode, width: number, height: number): BinNode {
  node.used = true;
  node.down = {x: node.x, y: node.y + height, width: node.width, height: node.height - height};
  node.right = {x: node.x + width, y: node.y, width: node.width - width, height: height};
  return node;
}

// 如果没有空间，向下扩展容器
function growDown(root: BinNode, height: number): BinNode {
  return {
    x: 0,
    y: 0,
    used: true,
    right: root,
    width: root.width,
    height: root.height + height,
    down: {x: 0, y: root.height, width: root.width, height: height},
  } as BinNode;
}

// 装箱算法
export function imagesPacking(images: string[], options: Partial<PackingOptions> = {}) {
  const {spacing = 0, maxWidth = 0} = options;
  const imagesInfo = images.map(url => {
    const info: ImageInfo = {url, top: 0, left: 0, width: 0, height: 0, img: document.createElement('img')};
    return new Promise<ImageInfo>(resolve => {
      info.img.onload = function () {
        resolve(Object.assign(info, {width: info.img.width, height: info.img.height}));
      };
      info.img.src = url;
    });
  });
  return Promise.all(imagesInfo).then((imagesInfo: Array<ImageInfo>) => {
    return packing(imagesInfo, {spacing, maxWidth});
  });
}

const makeTree = (paths: any) => {

  const data = paths.map((path: string, index: number) => ({ id: index, name: `/${path}` }))
  const base = { items: [] };

  for (const node of data) {
    const path = node.name.match(/\/[^\/]+/g);
    let curr: any = base;

    path.forEach((e: any, index: number) => {
      const currPath = path.slice(0, index + 1).join("");
      const child = curr.items.find((child: any) => child.name === currPath);

      if (child) {
        curr = child;
      } else {
        curr.items.push({
          id: node.id,
          name: currPath,
          items: [],
        });
        curr = curr.items[curr.items.length - 1];
      }
    });
  }

  return base.items;
};

export default makeTree
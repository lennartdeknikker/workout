const getNameFromPath = (pathString: string) =>
  pathString.split("/").pop()?.replace(/-+/g, " ");

  export default getNameFromPath
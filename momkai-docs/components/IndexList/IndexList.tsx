import getNameFromPath from "@/root/utils/getNameFromPath";
import makeTree from "@/root/utils/makeTree";
import { useRouter } from "next/router";
import Icon from "../Icon/Icon";

type IndexListProps = {
  paths: string[];
};

const IndexList = (props: IndexListProps) => {
  const { paths } = props;
  const { asPath } = useRouter()

  const LinkList = (props: { items: any[] }) => {
    const { items = [] } = props;
    return (
      <ul className="LinkList">
        {items.length > 0 &&
          items.map((child: any) => {
            const { id = "", name = "", items: childItems = [] } = child;
            return (
              <li className={`LinkList-item ${asPath.includes(name) ? 'is-active' : ''}`} key={id}>
                <a href={name}>{getNameFromPath(name)}</a>
                {childItems.length > 0 && <LinkList items={childItems} />}
              </li>
            );
          })}
      </ul>
    );
  };

  return (
    <div className="IndexList">
      <a href="/">
        <h3 className="IndexList-title"> <Icon name="logo" /> My docs</h3>
      </a>
      <LinkList items={makeTree(paths.filter((path) => path !== "index"))} />
    </div>
  );
};

export default IndexList;

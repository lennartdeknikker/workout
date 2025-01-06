import SvgLink from "@/svg/link.svg";
import SvgLogo from "@/svg/logo.svg";

type IconProps = {
  name: string;
};

const Icon = (props: IconProps) => {
  const {name}  = props
  return (
    <div className="Icon">
      {name === "link" && <SvgLink />}
      {name === "logo" && <SvgLogo />}
    </div>
  );
};

export default Icon;

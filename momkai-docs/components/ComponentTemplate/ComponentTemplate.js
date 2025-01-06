import PropTypes from "prop-types";
import SvgChevronDown from "@/svg/chevron-down.svg";

const ComponentTemplate = (props) => {
  const { text } = props;
  return (
    <div className="ComponentTemplate">
      {text} <SvgChevronDown />
    </div>
  );
};

ComponentTemplate.propTypes = {
  text: PropTypes.string,
};

ComponentTemplate.defaultProps = {
  text: "ComponentTemplate",
};

export default ComponentTemplate;

import "./TextBox.css";

export default function TextBox({
  text,
  name,
  disable,
  type,
  className,
  onChange,
  autoFocus,
  onBlur,
  ariaLabel,
  value,
  id,
  onClick,
  defaultValue,
}) {
  if (className == undefined) className = "";
  return (
    <>
      <input
        placeholder={text}
        id={id}
        name={name}
        className={"heTextBox" + " " + className}
        disabled={disable}
        type={type}
        onChange={onChange}
        autoFocus={autoFocus}
        onBlur={onBlur}
        aria-label={ariaLabel}
        value={value}
        onClick={onClick}
        defaultValue={defaultValue}
      />
    </>
  );
}

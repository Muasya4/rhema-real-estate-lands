import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

type FieldProps = {
  hint?: string;
  label: string;
};

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & FieldProps;
type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps;

export function TextInput({
  className = "",
  hint,
  id,
  label,
  ...props
}: TextInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className="field">
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        className={`field-control ${className}`.trim()}
        id={inputId}
        aria-describedby={hintId}
        {...props}
      />
      {hint ? (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextArea({
  className = "",
  hint,
  id,
  label,
  ...props
}: TextAreaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = hint ? `${textareaId}-hint` : undefined;

  return (
    <div className="field">
      <label className="field-label" htmlFor={textareaId}>
        {label}
      </label>
      <textarea
        className={`field-control field-control--textarea ${className}`.trim()}
        id={textareaId}
        aria-describedby={hintId}
        {...props}
      />
      {hint ? (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

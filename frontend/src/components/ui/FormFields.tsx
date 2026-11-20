import { Children, isValidElement, type ChangeEvent, type InputHTMLAttributes, type ReactElement, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Select as DsSelect, TextArea, TextField } from '@/ds';

/*
 * Ponte pro design system: as telas seguem com <Input>, <Textarea> e <Select> com <option> dentro,
 * e passam a desenhar o campo novo. O Select vira a lista da marca (nativo é proibido pela /site);
 * as <option> viram as opções e o onChange continua recebendo e.target.value.
 */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...rest }: InputProps) {
  return <TextField label={label} error={error} {...rest} />;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, ...rest }: TextareaProps) {
  return <TextArea label={label} error={error} {...rest} />;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  children: ReactNode;
}

function opcoes(children: ReactNode) {
  return Children.toArray(children)
    .filter((c): c is ReactElement<{ value?: string | number; children?: ReactNode; disabled?: boolean }> => isValidElement(c))
    .map((c) => {
      const texto = Children.toArray(c.props.children).join('');
      return { value: String(c.props.value ?? texto), label: texto, disabled: c.props.disabled };
    });
}

export function Select({ label, error, required, value, onChange, children, disabled }: SelectProps) {
  const lista = opcoes(children);
  const vazia = lista.find((o) => o.value === '');
  return (
    <div>
      <DsSelect
        label={label ? `${label}${required ? ' *' : ''}` : undefined}
        value={value === undefined ? '' : String(value)}
        placeholder={vazia?.label ?? 'Selecione'}
        options={lista.filter((o) => o.value !== '' && !o.disabled)}
        disabled={disabled}
        onChange={(v) => onChange?.({ target: { value: v }, currentTarget: { value: v } } as unknown as ChangeEvent<HTMLSelectElement>)}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-danger-fg">{error}</p>}
    </div>
  );
}

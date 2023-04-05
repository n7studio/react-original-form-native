import type { ReactNode } from "react";
import React, { forwardRef, Ref, useImperativeHandle } from "react";
import { FieldValues, FormProvider, Resolver, useForm } from "react-hook-form";
import { useOnWatchForm } from "../../hooks";
import { renderFormChild } from "../../utils";

interface FormProps<T> {
  children: ReactNode | ReactNode[];
  onSubmit?: (values: T) => void;
  defaultValues?: T;
  resolver?: Resolver<FieldValues, any> | undefined;
  mode?: "onBlur" | "onChange" | "onSubmit" | "onTouched" | "all";
  onWatch?: (values: T) => void;
  watch?: {
    fields?: string[];
    onChange: (value: Array<any> | T) => void;
  };
}

type FormRef = {
  submit: () => void;
};

function FormInner<T extends FieldValues>(
  { children, onSubmit, defaultValues, resolver, mode, watch }: FormProps<T>,
  ref?: Ref<FormRef>,
) {
  const {
    control,
    handleSubmit,
    formState,
    watch: baseWatch,
    reset,
    ...rest
  } = useForm({
    mode: mode,
    defaultValues: defaultValues as FieldValues,
    resolver: resolver,
  });

  useOnWatchForm(
    baseWatch,
    (values) => {
      watch?.onChange(values as Array<any> | T);
    },
    watch?.fields,
  );

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit((values) => onSubmit?.(values as T))(),
    reset: (resetData: FieldValues) => reset(resetData),
  }));

  return (
    <FormProvider
      {...{
        handleSubmit,
        control,
        watch: baseWatch,
        formState,
        reset,
        ...rest,
      }}
    >
      {React.Children.map(children, (child: ReactNode) => {
        return renderFormChild({
          child,
          control,
          onSubmit,
          handleSubmit,
          errors: formState.errors,
        });
      })}
    </FormProvider>
  );
}

const Form = forwardRef(FormInner) as <T>(
  props: FormProps<T> & { ref?: Ref<FormRef> },
) => ReturnType<typeof FormInner>;

export default Form;

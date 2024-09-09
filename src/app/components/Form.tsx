import { FormSchema, formSchema } from "@/utils/validation/form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { submitForm } from "../actions/form";

export default function RHForm() {
  // initialize the useForm hook with the Zod resolver and default values
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { private: false, image: null },
  });
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // function to handle file input changes
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setPreview(reader.result as string);
        setValue("image", file); // manually set the image in the form state
      };

      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const removeImage = () => {
    setPreview(null);
    hiddenFileInputRef.current!.value = "";
    setValue("image", null);
  };

  const triggerFileInput = () => hiddenFileInputRef.current?.click();

  const onSubmitForm: SubmitHandler<FormSchema> = async (data) => {
    // call the server action
    console.log("data?.image", data);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("private", data.private ? "true" : "false");
    formData.append("image", data.image as File);

    // call the server action
    const { data: success, errors } = await submitForm(formData);

    if (errors) {
      // handle errors (e.g., display an alert notification or add error messages to the form)
    }

    if (success) {
      // handle success (e.g., display a success notification)
    }

    // fallback notification can go here
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <div className="upload">
        {!preview && (
          <button type="button" onClick={triggerFileInput}>
            Upload Image
          </button>
        )}

        {preview && (
          <div className="preview">
            <Image
              src={preview}
              className="img"
              alt="profilePicture"
              height={50}
              width={50}
            />

            <div className="buttons">
              <button type="button" onClick={triggerFileInput}>
                Change Image
              </button>

              <button type="button" onClick={removeImage}>
                Remove Image
              </button>
            </div>
          </div>
        )}
        <input
          {...register("image")}
          ref={hiddenFileInputRef}
          hidden
          type="file"
          onChange={handleFileChange}
        />
        <p className="error">{errors.image && errors.image.message}</p>
      </div>

      <div className="field-wrap">
        <label htmlFor="name">Name </label>
        <input {...register("name")} type="text" />
        <p className="error">{errors.name && errors.name.message}</p>
      </div>

      <div className="field-wrap">
        <label htmlFor="description">Description </label>
        <textarea {...register("description")} />
        <p className="error">
          {errors.description && errors.description.message}
        </p>
      </div>

      <div className="private">
        <input {...register("private")} type="checkbox" />
        <label htmlFor="private">Is this private? </label>
        <p>{errors.private && errors.private.message}</p>
      </div>

      <button className="submit" disabled={isSubmitting}>
        {isSubmitting ? "Loading" : "Submit"}
      </button>
    </form>
  );
}

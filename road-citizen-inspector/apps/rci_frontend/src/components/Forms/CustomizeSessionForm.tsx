import { UPDATED_SESSION_SCHEMA  } from "@road-citizen-inspector/schemas"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form";
import TextInput from "../Inputs/TextInput";
import Button from "../Button";
import TextAreaInput from "../Inputs/TextAreaInput";
import type {UpdatedSessionSchema} from "@road-citizen-inspector/schemas";

export type CustomizeSessionFormProps = {
    initialValues?: UpdatedSessionSchema
    formName: string;
    onSubmitCallback: (data: UpdatedSessionSchema) => void
    disabled?: boolean
}
export default function CustomizeSessionForm({ initialValues, formName, onSubmitCallback, disabled }: CustomizeSessionFormProps) {

    const {register, handleSubmit, formState, reset } = useForm<UpdatedSessionSchema>({
        defaultValues: initialValues,
        resolver: zodResolver(UPDATED_SESSION_SCHEMA)
    })
 
    return (
        <form
            name={formName}
            className="flex flex-col gap-5"
            onSubmit={handleSubmit(onSubmitCallback)}
        >
            <TextInput
                {...register('title')}
                label="Session Name"
                description="The name of your session as it will appear to viewers."
                placeholder="e.g., Downtown Traffic Analysis"
                error={formState.errors.title?.message}
            />
            <TextAreaInput
                {...register('description')}
                rows={3}
                label="Session Description"
                description="A brief description of your session to help viewers understand the purpose of the session."
                placeholder="e.g., Analysis of traffic patterns during rush hour in downtown."
                error={formState.errors.description?.message}
            />
            <div className="flex justify-end gap-5 pt-5 border-t-1 border-neutral-300 flex-wrap">
                <Button disabled={disabled || !formState.isDirty} onClick={() => reset()} variant="secondary">Undo Changes</Button>
                <Button disabled={disabled || !formState.isDirty} type="submit">Save Changes</Button>
            </div>
        </form>
    )
}
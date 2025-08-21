//@ts-nocheck
import * as Yup from 'yup';

export const DispatchFormSchema = Yup.object({
    tracking_id:Yup.number().required("Please write tracking id"),
    tracking_web:Yup.string().required("Please write tracking link")
})


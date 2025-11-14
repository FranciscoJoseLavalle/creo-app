import { Field, ErrorMessage } from 'formik';

export const Input = ({ name, label, type = 'text', as = "input" }) => {
    return (
        <div className='input_container'>
            <Field type={type} name={name} id={name} as={as} required />
            <label htmlFor={name} className="dynamicLabel">{label}</label>
            <ErrorMessage
                name={name}
                component="div"
                className="form-error"
            />
        </div>
    )
}

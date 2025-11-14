import { useState } from 'react'
import { Formik, FieldArray, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './App.css'
import { Input } from './components/Input/Input';

const validationSchema = Yup.object({
  mp: Yup.string().required('Meta requerida'),
  mr: Yup.string().required('Meta requerida'),
  mc: Yup.string().required('Meta requerida'),
  me: Yup.string().required('Meta requerida'),
});

function App() {
  const [finalPercentage, setFinalPercentage] = useState(null);
  const [quadrant, setQuadrant] = useState('');

  const calculatePercentages = (values) => {
    console.log(values);
    const mp = calculateMP(values.meta_personal, values.meta_personal_final);
    const mr = calculateMR(values.meta_relaciones, 100, values.relations);
    const mc = calculateMC(values.meta_comunitario, values.meta_comunitario_final);
    const me = calculateME(values.meta_enrolados, values.meta_enrolados_final);

    const result = (mp + mr + mc + me) / 4;
    console.log(mp, mr, mc, me);
    setFinalPercentage(result);
    if (result >= 88) {
      setQuadrant('Jugar a ganar');
    }
    if (result >= 75 && result <= 87) {
      setQuadrant('Jugar a no perder');
    }
    if (result >= 50 && result <= 74) {
      setQuadrant('Solo jugar');
    }
    if (result <= 49) {
      setQuadrant('No jugar');
    }
  }

  const percentage = (initial, final) => {
    const result = Math.round((initial / final) * 100);
    if (result >= 100) {
      return 100;
    }
    return result
  }

  const calculateMP = (mp_actual, mp_end) => {
    const result = percentage(mp_actual, mp_end);

    return result;
  }

  const calculateMR = (mr_actual, mr_end, relations) => {
    const result = percentage(mr_actual, mr_end);
    if (relations.length > 0) {
      console.log(relations);
      let sumRelations = 0;
      relations.forEach(relation => {
        sumRelations += relation.current;
      })
      return Math.round(sumRelations / relations.length);
    }

    return result;
  }

  const calculateMC = (mc_actual, mc_end) => {
    const result = percentage(mc_actual, mc_end);

    return result;
  }

  const calculateME = (me_actual, me_end) => {
    const result = percentage(me_actual, me_end);

    return result;
  }

  return (
    <>
      <Formik
        initialValues={{
          meta_personal: 0,
          meta_personal_final: 0,
          meta_relaciones: 0,
          meta_comunitario: 0,
          meta_comunitario_final: 100,
          meta_enrolados: 0,
          meta_enrolados_final: 0,
          relations: [
            // { name: 'Relación 1', current: 0, target: 0 }
          ],
        }}
        // validationSchema={validationSchema}
        onSubmit={(values) => {
          calculatePercentages(values);
        }}>
        {({ errors, touched, values }) => (
          <Form className='form'>
            <div className='form_row'>
              <Input name={'meta_personal'} label="Meta Personal actual" />
              <Input name={'meta_personal_final'} label="Meta Personal final" />
            </div>
            <div className='form_row row_relations'>
              <FieldArray name="relations">
                {(helpers) => (
                  <>
                    <div className='form_row'>
                      <Input name={'meta_relaciones'} label="Meta Relaciones" />
                      <button
                        type="button"
                        className='form_add-btn'
                        onClick={() => helpers.push({ name: '', current: 0 })}
                      >+ Agregar relación</button>
                    </div>
                    <div className='form_relations_container'>
                      {values.relations?.map((_, idx) => (
                        <div key={idx} className="form_row">
                          <Input name={`relations[${idx}].name`} label="Nombre" />
                          <Input name={`relations[${idx}].current`} label="Actual" type="number" />
                          <button type="button" onClick={() => helpers.remove(idx)}>🗑</button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </FieldArray>
              {/* {relations.map(relation =>
                <div>
                  <Input name={`meta_relaciones`} label="Nombre" />
                  <Input name={`meta_relaciones`} label="Relación 1" />
                </div>
              )} */}
            </div>
            <div className='form_row'>
              <Input name={'meta_comunitario'} label="Meta Comunitario actual" />
              <Input name={'meta_comunitario_final'} label="Meta Comunitario final" />
            </div>
            <div className='form_row'>
              <Input name={'meta_enrolados'} label="Meta Enrolados actual" />
              <Input name={'meta_enrolados_final'} label="Meta Enrolados final" />
            </div>
            <button type='submit'>Calcular</button>
          </Form>
        )}
      </Formik>
      {finalPercentage && <div>Tu porcentaje actual es {finalPercentage}. {quadrant}.</div>}
    </>
  )
}

export default App

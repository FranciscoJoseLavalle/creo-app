import { useState } from 'react'
import { Formik, FieldArray, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './App.css'
import { Input } from './components/Input/Input';
import InfoImg from './assets/img/info.png';
import toast, { Toaster } from 'react-hot-toast';

const validationSchema = Yup.object({
  mp: Yup.string().required('Meta requerida'),
  mr: Yup.string().required('Meta requerida'),
  mc: Yup.string().required('Meta requerida'),
  me: Yup.string().required('Meta requerida'),
});

function App() {
  const [finalPercentage, setFinalPercentage] = useState(null);
  const [percentages, setPercentages] = useState([]);
  const [quadrant, setQuadrant] = useState('');

  const notify = () => toast.success(`Resultados copiados.`);

  const calculatePercentages = (values) => {
    const mp = calculateMP(values);
    const mr = calculateMR(values.meta_relaciones, 100, values.relations);
    const mc = calculateMC(values.meta_comunitario, values.meta_comunitario_final);
    const me = calculateME(values.meta_enrolados, values.meta_enrolados_final);

    let percentagesArray = [
      { name: 'Meta Personal', percentage: mp },
      { name: 'Meta Relaciones', percentage: mr },
      { name: 'Meta Comunitario', percentage: mc },
      { name: 'Meta Enrolados', percentage: me },
    ]
    setPercentages(percentagesArray);

    const result = (mp + mr + mc + me) / 4;
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

    window.gtag('event', 'calculatePercentages', {
      percentages: percentagesArray,
      result
    });
  }

  const percentage = (initial, final) => {
    const result = Math.round((parseFloat(initial) / parseFloat(final)) * 100);
    if (result >= 100) {
      return 100;
    }
    if (result >= 0) {
      return result;
    }
    return 0
  }

  const calculateMP = (values) => {
    if (values.meta_personal_fisica_start > 0) {
      const start = values.meta_personal_fisica_start;
      const actual = values.meta_personal_fisica_actual;
      const final = values.meta_personal_fisica_final;

      const target = start - final;
      const current = start - actual;

      return percentage(current, target);
    }

    return percentage(values.meta_personal, values.meta_personal_final);;
  }

  const calculateMR = (mr_actual, mr_end, relations) => {
    const result = percentage(mr_actual, mr_end);
    if (relations.length > 0) {
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

  const copyToClipboard = () => {
    const message = [
      ...percentages
        .filter(p => p.percentage >= 0)
        .map(p => `${p.name}: *${p.percentage}%*`),
      `Tu porcentaje actual es *${finalPercentage}%. ${quadrant}.*`
    ].join('\n');

    navigator.clipboard.writeText(message).then(() => {
      notify();
    })
  }

  return (
    <>
      <header><h1>Medir resultados Creo</h1></header>
      <main>
        <Formik
          initialValues={{
            meta_personal: 0,
            meta_personal_final: 0,
            meta_personal_fisica_start: 0,
            meta_personal_fisica_actual: 0,
            meta_personal_fisica_final: 0,
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
              <hr />
              <div className='form_row_fisica'>
                <p><img src={InfoImg} alt="Info IMG" width={20} /> (Opcional) Para las metas físicas, poner kg/grasa inicial, actual y objetivo final</p>
                <div className='form_row'>
                  <Input name={'meta_personal_fisica_start'} label="Meta Física inicial" />
                  <Input name={'meta_personal_fisica_actual'} label="Meta Física actual" />
                  <Input name={'meta_personal_fisica_final'} label="Meta Física final" />
                </div>
              </div>
              <hr />
              <div className='form_row row_relations'>
                <FieldArray name="relations">
                  {(helpers) => (
                    <>
                      <div className='form_row'>
                        <Input name={'meta_relaciones'} label="Meta Relaciones" />
                        <button
                          type="button"
                          className='btn btn-primary'
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
                {/* <Input name={'meta_comunitario_final'} label="Meta Comunitario final" /> */}
              </div>
              <div className='form_row'>
                <Input name={'meta_enrolados'} label="Meta Enrolados actual" />
                <Input name={'meta_enrolados_final'} label="Meta Enrolados final" />
              </div>
              <div className='form_row'>
                <button type='submit' className='btn btn-primary'>Calcular</button>
                <button type='button' className='btn btn-primary' onClick={copyToClipboard}>Copiar</button>
                <button type='reset' className='btn btn-danger'>Reiniciar</button>
              </div>
            </Form>
          )}
        </Formik>
        <div className='results'>
          {percentages.filter(p => p.percentage >= 0).map(percentage =>
            <div>
              {percentage.name} <b>{percentage.percentage}%</b>
            </div>
          )}
          {finalPercentage && <div>Tu porcentaje actual es <b>{finalPercentage}%. {quadrant}.</b></div>}
        </div>
        <Toaster position='bottom-right' />
      </main>
    </>
  )
}

export default App

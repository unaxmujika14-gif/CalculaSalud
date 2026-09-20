(function () {
  "use strict";
  window.__BRAND__ = {
    name: "CalculaSalud",
    tagline: "Calculadoras de salud claras, rápidas y gratis",
    year: 2026,
    nav: [
      { href: "index.html", label: "IMC" },
      { href: "calorias-diarias.html", label: "Calorías diarias" },
      { href: "semanas-embarazo.html", label: "Embarazo" }
    ],
    tools: [
      {
        id: "imc",
        href: "index.html",
        title: "Calculadora de IMC",
        desc: "Índice de masa corporal a partir de tu peso y altura, con su categoría."
      },
      {
        id: "calorias",
        href: "calorias-diarias.html",
        title: "Calculadora de calorías diarias",
        desc: "Cuántas calorías necesitas al día según tu metabolismo basal y actividad."
      },
      {
        id: "embarazo",
        href: "semanas-embarazo.html",
        title: "Semanas de embarazo y fecha de parto",
        desc: "En qué semana de embarazo estás y la fecha probable de parto."
      }
    ],
    faqsImc: [
      {
        q: "¿Cómo se calcula el IMC?",
        a: "El Índice de Masa Corporal se calcula dividiendo tu peso en kilogramos entre tu altura en metros al cuadrado: IMC = peso / altura². Es la fórmula que usan la mayoría de organismos de salud, incluida la OMS."
      },
      {
        q: "¿Qué significan las categorías del resultado?",
        a: "Por debajo de 18,5 se considera bajo peso; entre 18,5 y 24,9, peso normal; entre 25 y 29,9, sobrepeso; y 30 o más, obesidad. Son los rangos estándar de la Organización Mundial de la Salud para población adulta."
      },
      {
        q: "¿El IMC es fiable para todo el mundo?",
        a: "No del todo. El IMC no distingue entre masa muscular y masa grasa, así que puede sobrestimar el resultado en personas muy musculadas (deportistas, culturistas) y no es la métrica más adecuada durante el embarazo, en menores de edad ni en personas de edad muy avanzada. Es un indicador orientativo, no un diagnóstico."
      },
      {
        q: "¿Qué otras medidas complementan al IMC?",
        a: "El perímetro de cintura, el porcentaje de grasa corporal (medido por bioimpedancia o pliegues cutáneos) y la relación cintura-cadera dan una imagen más completa que el IMC por sí solo, especialmente para valorar el riesgo cardiovascular."
      },
      {
        q: "¿Debería preocuparme si mi IMC está fuera del rango normal?",
        a: "Un IMC puntual fuera del rango 18,5-24,9 no es por sí mismo un diagnóstico. Coméntalo con un médico o dietista-nutricionista, que valorará tu caso junto con otros factores (composición corporal, antecedentes, hábitos) antes de recomendar cualquier cambio."
      }
    ],
    faqsCalorias: [
      {
        q: "¿Qué es el metabolismo basal (TMB)?",
        a: "Es la cantidad de energía que tu cuerpo necesita en reposo absoluto para mantener funciones vitales como respirar o mantener la temperatura corporal. Esta calculadora lo estima con la fórmula de Mifflin-St Jeor, una de las más usadas y precisas para población general."
      },
      {
        q: "¿Cómo se pasa del metabolismo basal a las calorías diarias totales?",
        a: "Se multiplica el TMB por un factor según tu nivel de actividad física: sedentario (poco o ningún ejercicio), ligero (1-3 días/semana), moderado (3-5 días/semana), intenso (6-7 días/semana) o muy intenso (ejercicio físico intenso a diario o trabajo físico exigente)."
      },
      {
        q: "¿Sirve esta calculadora para perder o ganar peso?",
        a: "Te da el punto de partida: las calorías que necesitas para mantener tu peso actual. A partir de ahí, un déficit moderado (unas 300-500 kcal menos al día) suele usarse para perder peso de forma gradual, y un superávit similar para ganarlo — pero esto conviene ajustarlo con un profesional de la nutrición, especialmente si tienes alguna condición de salud."
      },
      {
        q: "¿Por qué la fórmula pide sexo, edad, peso y altura?",
        a: "El metabolismo basal varía con la masa corporal, la edad (tiende a bajar con los años) y, de media, entre hombres y mujeres por diferencias en la composición corporal. La fórmula de Mifflin-St Jeor usa estas cuatro variables porque son las que mejor explican esa variación en la población general."
      },
      {
        q: "¿Es exacta esta estimación?",
        a: "Es una fórmula validada científicamente y ampliamente usada, pero sigue siendo una estimación estadística basada en promedios poblacionales. Tu metabolismo real puede variar por genética, composición corporal o condiciones médicas. Úsala como punto de partida, no como una medición exacta de laboratorio."
      }
    ],
    faqsEmbarazo: [
      {
        q: "¿Cómo se calcula la fecha probable de parto?",
        a: "Se usa la regla de Naegele: se suman 280 días (40 semanas) a la fecha del primer día de tu última regla (FUM). Es el método estándar que usan matronas y ginecólogos como primera estimación, aunque tu médico puede ajustarla con una ecografía del primer trimestre."
      },
      {
        q: "¿Por qué el embarazo se cuenta desde la última regla y no desde la concepción?",
        a: "Porque la fecha exacta de la concepción rara vez se conoce con precisión, mientras que la fecha de la última regla sí. Por convención médica, la semana 1 de embarazo empieza el primer día de esa última regla, aunque la concepción ocurra unas dos semanas después."
      },
      {
        q: "¿Qué pasa si tengo ciclos irregulares?",
        a: "Si tus ciclos no duran 28 días o son irregulares, esta estimación por FUM pierde precisión. En ese caso, la ecografía del primer trimestre (que mide el tamaño del embrión) suele ser más fiable para datar el embarazo, y tu médico la usará para ajustar la fecha de parto."
      },
      {
        q: "¿Cuántas semanas dura un embarazo a término?",
        a: "Se considera un embarazo a término entre las semanas 37 y 42, con la semana 40 como fecha de referencia central. Nacer antes de la semana 37 se considera parto prematuro, y después de la 42, parto postérmino."
      },
      {
        q: "¿Esta calculadora sustituye el seguimiento médico?",
        a: "No. Es una estimación orientativa basada en una fórmula estándar. El seguimiento real del embarazo (ecografías, análisis, controles) debe hacerlo siempre un profesional sanitario, que es quien puede confirmar la edad gestacional real y detectar cualquier incidencia."
      }
    ],
    legal: {
      email: "hola@TU-DOMINIO-AQUI.com",
      nombreLegal: "[Nombre y apellidos / razón social del titular]",
      nif: "[NIF / CIF]",
      direccion: "[Dirección postal completa]"
    }
  };
})();

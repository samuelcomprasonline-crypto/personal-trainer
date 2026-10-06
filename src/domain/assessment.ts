import type { SkinfoldsData } from './types';

export function calculatePollock7(
  skinfolds: {
    peitoralMm: number;
    axilarMediaMm: number;
    subescapularMm: number;
    tricipitalMm: number;
    abdominalMm: number;
    suprailiacaMm: number;
    coxaMm: number;
  },
  idade: number,
  sexo: 'M' | 'F',
): { somaMm: number; densidadeCorporal: number; percGordura: number } {
  const soma =
    skinfolds.peitoralMm +
    skinfolds.axilarMediaMm +
    skinfolds.subescapularMm +
    skinfolds.tricipitalMm +
    skinfolds.abdominalMm +
    skinfolds.suprailiacaMm +
    skinfolds.coxaMm;

  let dc: number;
  if (sexo === 'M') {
    dc =
      1.112 -
      0.00043499 * soma +
      0.00000055 * Math.pow(soma, 2) -
      0.00028826 * idade;
  } else {
    dc =
      1.097 -
      0.00046971 * soma +
      0.00000056 * Math.pow(soma, 2) -
      0.00012828 * idade;
  }

  // Equação de Siri
  const percGordura = Math.max(2, Math.min(60, ((4.95 / dc) - 4.5) * 100));

  return {
    somaMm: Number(soma.toFixed(1)),
    densidadeCorporal: Number(dc.toFixed(4)),
    percGordura: Number(percGordura.toFixed(1)),
  };
}

export function calculatePollock3(
  skinfolds: {
    dobra1Mm: number;
    dobra2Mm: number;
    dobra3Mm: number;
  },
  idade: number,
  sexo: 'M' | 'F',
): { somaMm: number; densidadeCorporal: number; percGordura: number } {
  const soma = skinfolds.dobra1Mm + skinfolds.dobra2Mm + skinfolds.dobra3Mm;

  let dc: number;
  if (sexo === 'M') {
    // Homens: Peitoral, Abdominal, Coxa
    dc =
      1.10938 -
      0.0008267 * soma +
      0.0000016 * Math.pow(soma, 2) -
      0.0002574 * idade;
  } else {
    // Mulheres: Tríceps, Suprailíaca, Coxa
    dc =
      1.0994921 -
      0.0009929 * soma +
      0.0000023 * Math.pow(soma, 2) -
      0.0001392 * idade;
  }

  const percGordura = Math.max(2, Math.min(60, ((4.95 / dc) - 4.5) * 100));

  return {
    somaMm: Number(soma.toFixed(1)),
    densidadeCorporal: Number(dc.toFixed(4)),
    percGordura: Number(percGordura.toFixed(1)),
  };
}

export function processSkinfolds(
  data: SkinfoldsData,
  idade: number,
  sexo: 'M' | 'F',
): SkinfoldsData {
  if (
    data.protocolo === 'pollock_7' &&
    data.peitoralMm !== undefined &&
    data.axilarMediaMm !== undefined &&
    data.subescapularMm !== undefined &&
    data.tricipitalMm !== undefined &&
    data.abdominalMm !== undefined &&
    data.suprailiacaMm !== undefined &&
    data.coxaMm !== undefined
  ) {
    const res = calculatePollock7(
      {
        peitoralMm: data.peitoralMm,
        axilarMediaMm: data.axilarMediaMm,
        subescapularMm: data.subescapularMm,
        tricipitalMm: data.tricipitalMm,
        abdominalMm: data.abdominalMm,
        suprailiacaMm: data.suprailiacaMm,
        coxaMm: data.coxaMm,
      },
      idade,
      sexo,
    );

    return {
      ...data,
      somaDobrasMm: res.somaMm,
      densidadeCorporal: res.densidadeCorporal,
      percGorduraEstimado: res.percGordura,
    };
  }

  return data;
}

export function bodyMassComponents(pesoKg: number, percGordura: number) {
  const massaGordaKg = Number(((pesoKg * percGordura) / 100).toFixed(1));
  const massaMagraKg = Number((pesoKg - massaGordaKg).toFixed(1));
  return { massaGordaKg, massaMagraKg };
}

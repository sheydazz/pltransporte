import { DatosTransporte } from "@/app/components/ConfiguracionTransporte";

export interface ResultadoMetodoBase {
  asignaciones: number[][];
  costoTotal: number;
  origenes: string[];
  destinos: string[];
  costos: number[][];
}

export interface ResultadoMetodoConPasos extends ResultadoMetodoBase {
  pasos: string[];
}

const validarBalance = (ofertas: number[], demandas: number[]) => {
  const totalOferta = ofertas.reduce((acc, val) => acc + val, 0);
  const totalDemanda = demandas.reduce((acc, val) => acc + val, 0);

  if (totalOferta !== totalDemanda) {
    throw new Error(
      `El problema no está balanceado. Oferta total: ${totalOferta}, Demanda total: ${totalDemanda}.`
    );
  }
};

export function calcularEsquinaNoroeste(
  datos: DatosTransporte
): ResultadoMetodoConPasos {
  const { origenes, destinos } = datos;
  const suministros = datos.ofertas.map((valor) => Number(valor));
  const demandas = datos.demandas.map((valor) => Number(valor));
  const costos = datos.costos.map((fila) => fila.map((valor) => Number(valor)));

  validarBalance(suministros, demandas);

  const asignaciones = suministros.map(() =>
    Array(demandas.length).fill(0)
  );
  const pasos: string[] = [];

  let i = 0;
  let j = 0;
  let numeroPaso = 1;

  while (i < suministros.length && j < demandas.length) {
    if (suministros[i] === 0) {
      i++;
      continue;
    }
    if (demandas[j] === 0) {
      j++;
      continue;
    }

    const cantidad = Math.min(suministros[i], demandas[j]);
    asignaciones[i][j] = cantidad;

    const ofertaAntes = suministros[i];
    const demandaAntes = demandas[j];

    suministros[i] -= cantidad;
    demandas[j] -= cantidad;

    pasos.push(
      `Paso ${numeroPaso}: Se asignan ${cantidad} unidades de ${origenes[i]} hacia ${destinos[j]} (costo unitario ${costos[i][j]}). Oferta: ${ofertaAntes}→${suministros[i]}, Demanda: ${demandaAntes}→${demandas[j]}.`
    );
    numeroPaso++;

    if (suministros[i] === 0 && demandas[j] === 0) {
      pasos.push(
        `La oferta de ${origenes[i]} y la demanda de ${destinos[j]} llegaron a 0 simultáneamente. Se avanza a la siguiente columna y se conserva el 0 en la fila.`
      );
      j++;
    } else if (suministros[i] === 0) {
      pasos.push(
        `La oferta de ${origenes[i]} se agota. Se baja a la siguiente fila.`
      );
      i++;
    } else if (demandas[j] === 0) {
      pasos.push(
        `La demanda de ${destinos[j]} se satisface. Se avanza a la siguiente columna.`
      );
      j++;
    }
  }

  const costoTotal = asignaciones.reduce((total, fila, filaIdx) => {
    return (
      total +
      fila.reduce(
        (acc, valor, colIdx) => acc + valor * costos[filaIdx][colIdx],
        0
      )
    );
  }, 0);

  return {
    asignaciones,
    costoTotal,
    pasos,
    origenes,
    destinos,
    costos,
  };
}

export function calcularCostoMinimo(
  datos: DatosTransporte
): ResultadoMetodoConPasos {
  const { origenes, destinos } = datos;
  const suministros = datos.ofertas.map((valor) => Number(valor));
  const demandas = datos.demandas.map((valor) => Number(valor));
  const costos = datos.costos.map((fila) => fila.map((valor) => Number(valor)));

  validarBalance(suministros, demandas);

  const asignaciones = suministros.map(() =>
    Array(demandas.length).fill(0)
  );
  const pasos: string[] = [];

  let numeroPaso = 1;

  const obtenerSiguienteCelda = () => {
    let minCosto = Number.POSITIVE_INFINITY;
    let pos: { fila: number; col: number } | null = null;

    for (let i = 0; i < suministros.length; i++) {
      if (suministros[i] === 0) continue;

      for (let j = 0; j < demandas.length; j++) {
        if (demandas[j] === 0) continue;

        const costo = costos[i][j];

        if (costo < minCosto) {
          minCosto = costo;
          pos = { fila: i, col: j };
        }
      }
    }
    return pos;
  };

  while (true) {
    const siguiente = obtenerSiguienteCelda();

    if (!siguiente) break;

    const { fila: i, col: j } = siguiente;
    const cantidad = Math.min(suministros[i], demandas[j]);
    const ofertaAntes = suministros[i];
    const demandaAntes = demandas[j];

    asignaciones[i][j] = cantidad;
    suministros[i] -= cantidad;
    demandas[j] -= cantidad;

    pasos.push(
      `Paso ${numeroPaso}: Se asignan ${cantidad} unidades en la celda (${origenes[i]} → ${destinos[j]}), costo unitario ${costos[i][j]}. Oferta ${origenes[i]}: ${ofertaAntes}→${suministros[i]}, Demanda ${destinos[j]}: ${demandaAntes}→${demandas[j]}.`
    );
    numeroPaso++;

    if (suministros[i] === 0 && demandas[j] === 0) {
      pasos.push(
        `La oferta de ${origenes[i]} y la demanda de ${destinos[j]} quedaron en 0 simultáneamente. Se tacha solo una de las dos y se deja el 0 visible en la otra, continuando con la siguiente celda de costo mínimo.`
      );
    } else if (suministros[i] === 0) {
      pasos.push(
        `La oferta de ${origenes[i]} se agotó. Se tacha la fila correspondiente.`
      );
    } else if (demandas[j] === 0) {
      pasos.push(
        `La demanda de ${destinos[j]} se satisfizo. Se tacha la columna correspondiente.`
      );
    }
  }

  const costoTotal = asignaciones.reduce((total, fila, filaIdx) => {
    return (
      total +
      fila.reduce(
        (acc, valor, colIdx) => acc + valor * costos[filaIdx][colIdx],
        0
      )
    );
  }, 0);

  return {
    asignaciones,
    costoTotal,
    pasos,
    origenes,
    destinos,
    costos,
  };
}

export function calcularVogel(datos: DatosTransporte): ResultadoMetodoBase {
  const costos = datos.costos.map((fila) => fila.map((valor) => Number(valor)));
  const ofertas = datos.ofertas.map((valor) => Number(valor));
  const demandas = datos.demandas.map((valor) => Number(valor));

  validarBalance(ofertas, demandas);

  const origenes = datos.origenes.map((nombre, idx) =>
    nombre && nombre.trim().length > 0 ? nombre : `Origen ${idx + 1}`
  );
  const destinos = datos.destinos.map((nombre, idx) =>
    nombre && nombre.trim().length > 0 ? nombre : `Destino ${idx + 1}`
  );

  const allocation = (() => {
    const supply = [...ofertas];
    const demand = [...demandas];
    const m = supply.length;
    const n = demand.length;

    const result = Array.from({ length: m }, () => Array(n).fill(0));
    const rowActive = Array(m).fill(true);
    const colActive = Array(n).fill(true);

    const penalty = (values: number[]): number => {
      if (values.length === 0) return 0;
      if (values.length === 1) return values[0];
      const sorted = values.slice().sort((a, b) => a - b);
      return sorted[1] - sorted[0];
    };

    while (true) {
      const hasActiveRow = rowActive.some((r) => r);
      const hasActiveCol = colActive.some((c) => c);
      if (!hasActiveRow || !hasActiveCol) break;

      const rowPenalty = Array(m).fill(-1);
      const colPenalty = Array(n).fill(-1);

      for (let i = 0; i < m; i++) {
        if (!rowActive[i]) continue;
        const rowValues: number[] = [];
        for (let j = 0; j < n; j++) {
          if (colActive[j]) rowValues.push(costos[i][j]);
        }
        if (rowValues.length > 0) {
          rowPenalty[i] = penalty(rowValues);
        }
      }

      for (let j = 0; j < n; j++) {
        if (!colActive[j]) continue;
        const colValues: number[] = [];
        for (let i = 0; i < m; i++) {
          if (rowActive[i]) colValues.push(costos[i][j]);
        }
        if (colValues.length > 0) {
          colPenalty[j] = penalty(colValues);
        }
      }

      const maxRow = Math.max(...rowPenalty.filter((p) => p >= 0));
      const maxCol = Math.max(...colPenalty.filter((p) => p >= 0));

      if (maxRow === -Infinity && maxCol === -Infinity) break;

      let chosenRow = -1;
      let chosenCol = -1;

      if (maxRow >= maxCol) {
        chosenRow = rowPenalty.indexOf(maxRow);
        let min = Infinity;
        for (let j = 0; j < n; j++) {
          if (colActive[j] && costos[chosenRow][j] < min) {
            min = costos[chosenRow][j];
            chosenCol = j;
          }
        }
      } else {
        chosenCol = colPenalty.indexOf(maxCol);
        let min = Infinity;
        for (let i = 0; i < m; i++) {
          if (rowActive[i] && costos[i][chosenCol] < min) {
            min = costos[i][chosenCol];
            chosenRow = i;
          }
        }
      }

      if (chosenRow === -1 || chosenCol === -1) break;

      const qty = Math.min(supply[chosenRow], demand[chosenCol]);
      result[chosenRow][chosenCol] = qty;
      supply[chosenRow] -= qty;
      demand[chosenCol] -= qty;

      if (supply[chosenRow] === 0) rowActive[chosenRow] = false;
      if (demand[chosenCol] === 0) colActive[chosenCol] = false;
    }

    return result;
  })();

  const costoTotal = allocation.reduce((total, fila, filaIdx) => {
    return (
      total +
      fila.reduce(
        (acc, valor, colIdx) => acc + valor * costos[filaIdx][colIdx],
        0
      )
    );
  }, 0);

  return {
    asignaciones: allocation,
    costoTotal,
    origenes,
    destinos,
    costos,
  };
}


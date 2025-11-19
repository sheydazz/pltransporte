"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import ConfiguracionTransporte, {
  DatosTransporte,
} from "../components/ConfiguracionTransporte";

/**
 * Interface que define la estructura del resultado del método de Aproximación de Vogel
 */
interface ResultadoVogel {
  asignaciones: number[][];
  costoTotal: number;
  origenes: string[];
  destinos: string[];
  costos: number[][];
}

/**
 * Componente principal de la página del Método de Aproximación de Vogel
 * Maneja la recolección de datos, cálculo y visualización de resultados
 */
function Vogel() {
  const [resultado, setResultado] = useState<ResultadoVogel | null>(null);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  /**
   * Implementa el algoritmo de Aproximación de Vogel (VAM) para resolver problemas de transporte.
   * 
   * Este método heurístico considera penalizaciones (diferencias entre los dos menores costos)
   * para encontrar mejores soluciones iniciales:
   * 1. Calcula penalizaciones para cada fila y columna (diferencia entre 2 menores costos)
   * 2. Selecciona la fila o columna con mayor penalización
   * 3. Asigna a la celda de menor costo en esa fila/columna
   * 4. Tacha la fila o columna satisfecha
   * 5. Repite hasta que quede exactamente una fila o columna sin tachar
   * 
   * @param initialCosts - Matriz de costos unitarios de transporte
   * @param initialSupply - Array de ofertas disponibles en cada origen
   * @param initialDemand - Array de demandas requeridas en cada destino
   * @returns Matriz de asignaciones (cantidad a transportar de cada origen a cada destino)
   */
  function vogelMethod(
    initialCosts: number[][],
    initialSupply: number[],
    initialDemand: number[]
  ): number[][] {
    // Crear copias para no modificar los originales
    const supply = [...initialSupply];
    const demand = [...initialDemand];
    const costs = initialCosts.map((row) => [...row]);

    const m = supply.length;
    const n = demand.length;

    // Matriz de asignación inicial en ceros
    const allocation = Array.from({ length: m }, () => Array(n).fill(0));

    // Control de filas y columnas activas
    const rowActive = Array(m).fill(true);
    const colActive = Array(n).fill(true);

    /**
     * Calcula la penalización de una fila o columna (diferencia entre los dos menores costos)
     * @param values - Array de costos disponibles en la fila/columna
     * @returns Diferencia entre el segundo menor y el menor costo, o 0 si hay menos de 2 valores
     */
    function penalty(values: number[]): number {
      if (values.length === 0) return 0;
      if (values.length === 1) return values[0]; // Si solo hay un valor, usar ese

      const sorted = values.slice().sort((a, b) => a - b);
      return sorted[1] - sorted[0];
    }

    // Repetir hasta que todo esté asignado
    while (true) {
      // Verificar si quedan celdas activas
      const hasActiveRow = rowActive.some((r) => r);
      const hasActiveCol = colActive.some((c) => c);

      if (!hasActiveRow || !hasActiveCol) break;

      const rowPenalty = Array(m).fill(-1);
      const colPenalty = Array(n).fill(-1);

      // Calcular penalizaciones de filas
      for (let i = 0; i < m; i++) {
        if (!rowActive[i]) continue;

        const rowValues = [];
        for (let j = 0; j < n; j++) {
          if (colActive[j]) rowValues.push(costs[i][j]);
        }

        if (rowValues.length > 0) {
          rowPenalty[i] = penalty(rowValues);
        }
      }

      // Calcular penalizaciones de columnas
      for (let j = 0; j < n; j++) {
        if (!colActive[j]) continue;

        const colValues = [];
        for (let i = 0; i < m; i++) {
          if (rowActive[i]) colValues.push(costs[i][j]);
        }

        if (colValues.length > 0) {
          colPenalty[j] = penalty(colValues);
        }
      }

      // Encontrar la penalización máxima
      const maxRow = Math.max(...rowPenalty.filter((p) => p >= 0));
      const maxCol = Math.max(...colPenalty.filter((p) => p >= 0));

      if (maxRow === -Infinity && maxCol === -Infinity) break;

      let chosenRow = -1;
      let chosenCol = -1;

      // Decidir si trabajar con fila o columna (mayor penalización)
      if (maxRow >= maxCol) {
        // Escoger la fila con mayor penalización
        chosenRow = rowPenalty.indexOf(maxRow);

        // Encontrar la columna con menor costo en esa fila
        let min = Infinity;
        for (let j = 0; j < n; j++) {
          if (colActive[j] && costs[chosenRow][j] < min) {
            min = costs[chosenRow][j];
            chosenCol = j;
          }
        }
      } else {
        // Escoger la columna con mayor penalización
        chosenCol = colPenalty.indexOf(maxCol);

        // Encontrar la fila con menor costo en esa columna
        let min = Infinity;
        for (let i = 0; i < m; i++) {
          if (rowActive[i] && costs[i][chosenCol] < min) {
            min = costs[i][chosenCol];
            chosenRow = i;
          }
        }
      }

      if (chosenRow === -1 || chosenCol === -1) break;

      // Asignar la cantidad máxima posible
      const qty = Math.min(supply[chosenRow], demand[chosenCol]);
      allocation[chosenRow][chosenCol] = qty;

      // Actualizar oferta y demanda
      supply[chosenRow] -= qty;
      demand[chosenCol] -= qty;

      // Desactivar filas/columnas satisfechas
      if (supply[chosenRow] === 0) rowActive[chosenRow] = false;
      if (demand[chosenCol] === 0) colActive[chosenCol] = false;
    }

    return allocation;
  }

  /**
   * Calcula el costo total de la solución de transporte
   * @param asignacion - Matriz de asignaciones (cantidades transportadas)
   * @param costos - Matriz de costos unitarios
   * @returns Costo total = suma de (asignación[i][j] * costo[i][j]) para todas las celdas
   */
  function calcularCostoTotal(asignacion: number[][], costos: number[][]): number {
    let total = 0;
    for (let i = 0; i < asignacion.length; i++) {
      for (let j = 0; j < asignacion[0].length; j++) {
        total += asignacion[i][j] * costos[i][j];
      }
    }
    return total;
  }

  /**
   * Maneja el cálculo de la solución cuando el usuario presiona "Calcular Solución"
   * Valida que el problema esté balanceado y ejecuta el algoritmo de Vogel
   * @param datos - Datos del problema de transporte ingresados por el usuario
   */
  const handleCalcular = (datos: DatosTransporte) => {
    try {
      const costos = datos.costos.map((fila) =>
        fila.map((valor) => Number(valor))
      );
      const ofertas = datos.ofertas.map((valor) => Number(valor));
      const demandas = datos.demandas.map((valor) => Number(valor));

      const totalOferta = ofertas.reduce((acc, val) => acc + val, 0);
      const totalDemanda = demandas.reduce((acc, val) => acc + val, 0);

      if (totalOferta !== totalDemanda) {
        throw new Error(
          `El problema no está balanceado. Oferta total: ${totalOferta}, Demanda total: ${totalDemanda}.`
        );
      }

      const asignaciones = vogelMethod(costos, ofertas, demandas);
      const costoTotal = calcularCostoTotal(asignaciones, costos);

      const origenes = datos.origenes.map((nombre, idx) =>
        nombre && nombre.trim().length > 0 ? nombre : `Origen ${idx + 1}`
      );
      const destinos = datos.destinos.map((nombre, idx) =>
        nombre && nombre.trim().length > 0 ? nombre : `Destino ${idx + 1}`
      );

      setResultado({
        asignaciones,
        costoTotal,
        origenes,
        destinos,
        costos,
      });
      setErrorMensaje(null);
    } catch (error) {
      setResultado(null);
      setErrorMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo calcular la solución inicial."
      );
    }
  };

  /**
   * Calcula el número total de asignaciones realizadas (celdas con valor > 0)
   * Se recalcula automáticamente cuando cambia el resultado
   */
  const asignacionesRealizadas = useMemo(() => {
    if (!resultado) return 0;
    return resultado.asignaciones.reduce(
      (count, fila) => count + fila.filter((val) => val > 0).length,
      0
    );
  }, [resultado]);

  /**
   * Formatea un número con separadores de miles y decimales
   * @param valor - Número a formatear
   * @param decimales - Número de decimales a mostrar (por defecto 0)
   * @returns String formateado según la localización española
   */
  const formatearNumero = (valor: number, decimales = 0) =>
    valor.toLocaleString("es-ES", {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-indigo-900 dark:to-blue-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
            Método de Aproximación de Vogel
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ingrese los datos del problema de transporte
          </p>
        </div>

        {/* Configuración */}
        <ConfiguracionTransporte
          onCalcular={handleCalcular}
          colorPrimario="indigo"
          colorSecundario="cyan"
        />

        {errorMensaje && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50/80 text-red-800 px-4 py-3 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200">
            {errorMensaje}
          </div>
        )}

        {resultado && (
          <section className="mt-6 space-y-6">
            <div className="bg-white/90 dark:bg-gray-900/80 border border-indigo-200 dark:border-indigo-800 rounded-2xl shadow-lg p-6 backdrop-blur">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-indigo-600 dark:text-indigo-300 font-semibold">
                    Solución Básica Inicial
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Aproximación de Vogel
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Asignaciones realizadas
                  </p>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                    {asignacionesRealizadas}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
                  <p className="text-sm text-indigo-700 dark:text-indigo-200">
                    Costo total
                  </p>
                  <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-100">
                    {formatearNumero(resultado.costoTotal, 2)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800">
                  <p className="text-sm text-cyan-700 dark:text-cyan-200">
                    Orígenes
                  </p>
                  <p className="text-2xl font-bold text-cyan-800 dark:text-cyan-100">
                    {resultado.origenes.length}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Destinos
                  </p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-100">
                    {resultado.destinos.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-gray-900/80 border border-indigo-200 dark:border-indigo-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Tabla de asignaciones
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-indigo-100 dark:bg-indigo-900">
                      <th className="border p-3 dark:border-gray-700">
                        Origen / Destino
                      </th>
                      {resultado.destinos.map((destino, idx) => (
                        <th
                          key={destino + idx}
                          className="border p-3 dark:border-gray-700"
                        >
                          {destino}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.asignaciones.map((fila, filaIdx) => (
                      <tr
                        key={resultado.origenes[filaIdx]}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="border p-3 font-semibold bg-indigo-50 dark:bg-indigo-900 dark:border-gray-700">
                          {resultado.origenes[filaIdx]}
                        </td>
                        {fila.map((valor, colIdx) => (
                          <td
                            key={`${filaIdx}-${colIdx}`}
                            className={`border p-3 text-center dark:border-gray-700 ${
                              valor > 0
                                ? "bg-green-100 dark:bg-green-900 font-bold"
                                : ""
                            }`}
                          >
                            {valor > 0 ? (
                              <div>
                                <p className="text-lg">
                                  {formatearNumero(valor)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-300">
                                  costo {resultado.costos[filaIdx][colIdx]}
                                </p>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Vogel;

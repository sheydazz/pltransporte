"use client";
import React, { useState } from "react";

/**
 * Props del componente ConfiguracionTransporte
 */
interface ConfiguracionTransporteProps {
  onCalcular: (datos: DatosTransporte) => void;
  textoBoton?: string;
}

/**
 * Interface que define la estructura de datos del problema de transporte
 * Usada para pasar información entre el componente de configuración y los algoritmos
 */
export interface DatosTransporte {
  numOrigenes: number;
  numDestinos: number;
  origenes: string[];
  destinos: string[];
  ofertas: number[];
  demandas: number[];
  costos: number[][];
}

/**
 * Componente reutilizable para la recolección de datos del problema de transporte.
 * Permite configurar orígenes, destinos, ofertas, demandas y matriz de costos.
 * 
 * @param onCalcular - Función callback que se ejecuta cuando el usuario presiona "Calcular Solución"
 */
export default function ConfiguracionTransporte({
  onCalcular,
  textoBoton = "Calcular Solución",
}: ConfiguracionTransporteProps) {
  const [numOrigenes, setNumOrigenes] = useState(2);
  const [numDestinos, setNumDestinos] = useState(2);
  const [origenes, setOrigenes] = useState<string[]>(["Origen 1", "Origen 2"]);
  const [destinos, setDestinos] = useState<string[]>([
    "Destino 1",
    "Destino 2",
  ]);
  const [ofertas, setOfertas] = useState<number[]>([0, 0]);
  const [demandas, setDemandas] = useState<number[]>([0, 0]);
  const [costos, setCostos] = useState<number[][]>([
    [0, 0],
    [0, 0],
  ]);
  const [mostrarTabla, setMostrarTabla] = useState(false);

  /**
   * Actualiza las dimensiones del problema (número de orígenes y destinos)
   * y regenera las estructuras de datos correspondientes
   */
  const actualizarDimensiones = () => {
    const newOrigenes = Array(numOrigenes)
      .fill("")
      .map((_, i) => origenes[i] || `Origen ${i + 1}`);
    const newDestinos = Array(numDestinos)
      .fill("")
      .map((_, i) => destinos[i] || `Destino ${i + 1}`);
    const newOfertas = Array(numOrigenes)
      .fill(0)
      .map((_, i) => ofertas[i] || 0);
    const newDemandas = Array(numDestinos)
      .fill(0)
      .map((_, i) => demandas[i] || 0);
    const newCostos = Array(numOrigenes)
      .fill(0)
      .map((_, i) =>
        Array(numDestinos)
          .fill(0)
          .map((_, j) => costos[i]?.[j] || 0)
      );

    setOrigenes(newOrigenes);
    setDestinos(newDestinos);
    setOfertas(newOfertas);
    setDemandas(newDemandas);
    setCostos(newCostos);
    setMostrarTabla(true);
  };

  /**
   * Actualiza el nombre de un origen específico
   * @param index - Índice del origen a actualizar
   * @param value - Nuevo nombre del origen
   */
  const actualizarOrigen = (index: number, value: string) => {
    const newOrigenes = [...origenes];
    newOrigenes[index] = value;
    setOrigenes(newOrigenes);
  };

  /**
   * Actualiza el nombre de un destino específico
   * @param index - Índice del destino a actualizar
   * @param value - Nuevo nombre del destino
   */
  const actualizarDestino = (index: number, value: string) => {
    const newDestinos = [...destinos];
    newDestinos[index] = value;
    setDestinos(newDestinos);
  };

  /**
   * Actualiza la oferta de un origen específico
   * Convierte el string del input a número, manejando valores vacíos como 0
   * @param index - Índice del origen
   * @param value - Valor de la oferta (string del input)
   */
  const actualizarOferta = (index: number, value: string) => {
    const newOfertas = [...ofertas];
    newOfertas[index] = value === "" ? 0 : Number(value);
    setOfertas(newOfertas);
  };

  /**
   * Actualiza la demanda de un destino específico
   * Convierte el string del input a número, manejando valores vacíos como 0
   * @param index - Índice del destino
   * @param value - Valor de la demanda (string del input)
   */
  const actualizarDemanda = (index: number, value: string) => {
    const newDemandas = [...demandas];
    newDemandas[index] = value === "" ? 0 : Number(value);
    setDemandas(newDemandas);
  };

  /**
   * Actualiza el costo de transporte de un origen a un destino específico
   * Convierte el string del input a número, manejando valores vacíos como 0
   * @param i - Índice del origen (fila)
   * @param j - Índice del destino (columna)
   * @param value - Valor del costo (string del input)
   */
  const actualizarCosto = (i: number, j: number, value: string) => {
    const newCostos = [...costos];
    newCostos[i][j] = value === "" ? 0 : Number(value);
    setCostos(newCostos);
  };

  /**
   * Maneja el evento de clic en el botón "Calcular Solución"
   * Recolecta todos los datos y los pasa al callback onCalcular
   */
  const handleCalcular = () => {
    onCalcular({
      numOrigenes,
      numDestinos,
      origenes,
      destinos,
      ofertas,
      demandas,
      costos,
    });
  };

  return (
    <div>
      {/* Configuración inicial - Compacta */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
          Configuración
        </h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Orígenes
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={numOrigenes}
              onChange={(e) => setNumOrigenes(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Destinos
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={numDestinos}
              onChange={(e) => setNumDestinos(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={actualizarDimensiones}
            className="px-4 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium whitespace-nowrap"
          >
            Generar
          </button>
        </div>
      </div>

      {mostrarTabla && (
        <>
          {/* Tabla compacta con todo junto */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
              Datos del Problema
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Tabla de Orígenes */}
              <div className="mb-4 md:mb-0">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Orígenes y Ofertas
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300 dark:border-gray-600">
                        <th className="text-left py-1 px-2 text-gray-600 dark:text-gray-400 font-medium">
                          #
                        </th>
                        <th className="text-left py-1 px-2 text-gray-600 dark:text-gray-400 font-medium">
                          Nombre
                        </th>
                        <th className="text-left py-1 px-2 text-gray-600 dark:text-gray-400 font-medium">
                          Oferta
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {origenes.map((origen, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-200 dark:border-gray-700"
                        >
                          <td className="py-1 px-2 text-gray-700 dark:text-gray-300">
                            {index + 1}
                          </td>
                          <td className="py-1 px-2">
                            <input
                              type="text"
                              value={origen}
                              onChange={(e) =>
                                actualizarOrigen(index, e.target.value)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                          </td>
                          <td className="py-1 px-2">
                            <input
                              type="number"
                              min="0"
                              value={ofertas[index]}
                              onFocus={(e) => {
                                if (e.target.value === "0") e.target.value = "";
                              }}
                              onBlur={(e) => {
                                if (e.target.value === "") e.target.value = "0";
                                actualizarOferta(index, e.target.value);
                              }}
                              onChange={(e) =>
                                actualizarOferta(index, e.target.value)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabla de Destinos */}
              <div className="mb-4 md:mb-0">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Destinos y Demandas
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300 dark:border-gray-600">
                        <th className="text-left py-1 px-2 text-gray-600 dark:text-gray-400 font-medium">
                          #
                        </th>
                        <th className="text-left py-1 px-2 text-gray-600 dark:text-gray-400 font-medium">
                          Nombre
                        </th>
                        <th className="text-left py-1 px-2 text-gray-600 dark:text-gray-400 font-medium">
                          Demanda
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {destinos.map((destino, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-200 dark:border-gray-700"
                        >
                          <td className="py-1 px-2 text-gray-700 dark:text-gray-300">
                            {index + 1}
                          </td>
                          <td className="py-1 px-2">
                            <input
                              type="text"
                              value={destino}
                              onChange={(e) =>
                                actualizarDestino(index, e.target.value)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                          </td>
                          <td className="py-1 px-2">
                            <input
                              type="number"
                              min="0"
                              value={demandas[index]}
                              onFocus={(e) => {
                                if (e.target.value === "0") e.target.value = "";
                              }}
                              onBlur={(e) => {
                                if (e.target.value === "") e.target.value = "0";
                                actualizarDemanda(index, e.target.value);
                              }}
                              onChange={(e) =>
                                actualizarDemanda(index, e.target.value)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Matriz de Costos Compacta */}
            <div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Matriz de Costos
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white text-xs">
                        O/D
                      </th>
                      {destinos.map((destino, index) => (
                        <th
                          key={index}
                          className="border border-gray-300 dark:border-gray-600 p-2 bg-blue-50 dark:bg-blue-900/20 text-gray-800 dark:text-white text-xs"
                        >
                          {destino}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {origenes.map((origen, i) => (
                      <tr key={i}>
                        <td className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-700/50 font-medium text-gray-800 dark:text-white text-xs">
                          {origen}
                        </td>
                        {destinos.map((_, j) => (
                          <td
                            key={j}
                            className="border border-gray-300 dark:border-gray-600 p-1"
                          >
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={costos[i][j]}
                              onFocus={(e) => {
                                if (e.target.value === "0") e.target.value = "";
                              }}
                              onBlur={(e) => {
                                if (e.target.value === "") e.target.value = "0";
                                actualizarCosto(i, j, e.target.value);
                              }}
                              onChange={(e) =>
                                actualizarCosto(i, j, e.target.value)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Botón para calcular */}
          <div className="flex justify-center">
            <button
              onClick={handleCalcular}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-md"
            >
              {textoBoton}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

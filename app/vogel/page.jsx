"use client";
import React, { useState } from "react";

// Componente de configuración simulado
function ConfiguracionTransporte({
  onCalcular,
  colorPrimario,
  colorSecundario,
}) {
  const [filas, setFilas] = useState(2);
  const [columnas, setColumnas] = useState(2);
  const [costos, setCostos] = useState([
    [5, 8],
    [7, 6],
  ]);
  const [ofertas, setOfertas] = useState([20, 30]);
  const [demandas, setDemandas] = useState([25, 25]);

  const handleFilasChange = (e) => {
    const n = parseInt(e.target.value);
    setFilas(n);
    setCostos(
      Array(n)
        .fill(0)
        .map(() => Array(columnas).fill(0))
    );
    setOfertas(Array(n).fill(0));
  };

  const handleColumnasChange = (e) => {
    const n = parseInt(e.target.value);
    setColumnas(n);
    setCostos(
      Array(filas)
        .fill(0)
        .map(() => Array(n).fill(0))
    );
    setDemandas(Array(n).fill(0));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-6">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Orígenes (filas)
          </label>
          <input
            type="number"
            min="2"
            max="10"
            value={filas}
            onChange={handleFilasChange}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Destinos (columnas)
          </label>
          <input
            type="number"
            min="2"
            max="10"
            value={columnas}
            onChange={handleColumnasChange}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Matriz de Costos
        </label>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {costos.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="p-1">
                      <input
                        type="number"
                        value={cell}
                        onFocus={(e) => {
                          if (e.target.value === "0") {
                            e.target.value = "";
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            const newCostos = [...costos];
                            newCostos[i][j] = 0;
                            setCostos(newCostos);
                          }
                        }}
                        onChange={(e) => {
                          const newCostos = [...costos];
                          newCostos[i][j] = parseFloat(e.target.value) || 0;
                          setCostos(newCostos);
                        }}
                        className="w-full px-2 py-1 border rounded text-center dark:bg-gray-700 dark:border-gray-600"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Ofertas</label>
          {ofertas.map((oferta, i) => (
            <input
              key={i}
              type="number"
              value={oferta}
              onFocus={(e) => {
                if (e.target.value === "0") {
                  e.target.value = "";
                }
              }}
              onBlur={(e) => {
                if (e.target.value === "") {
                  const newOfertas = [...ofertas];
                  newOfertas[i] = 0;
                  setOfertas(newOfertas);
                }
              }}
              onChange={(e) => {
                const newOfertas = [...ofertas];
                newOfertas[i] = parseFloat(e.target.value) || 0;
                setOfertas(newOfertas);
              }}
              className="w-full px-2 py-1 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600"
            />
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Demandas</label>
          {demandas.map((demanda, i) => (
            <input
              key={i}
              type="number"
              value={demanda}
              onFocus={(e) => {
                if (e.target.value === "0") {
                  e.target.value = "";
                }
              }}
              onBlur={(e) => {
                if (e.target.value === "") {
                  const newDemandas = [...demandas];
                  newDemandas[i] = 0;
                  setDemandas(newDemandas);
                }
              }}
              onChange={(e) => {
                const newDemandas = [...demandas];
                newDemandas[i] = parseFloat(e.target.value) || 0;
                setDemandas(newDemandas);
              }}
              className="w-full px-2 py-1 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600"
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => onCalcular({ costos, ofertas, demandas })}
        className={`w-full bg-gradient-to-r from-${colorPrimario}-600 to-${colorSecundario}-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition`}
      >
        Calcular
      </button>
    </div>
  );
}

function Vogel() {
  const [resultado, setResultado] = useState(null);
  const [costoTotal, setCostoTotal] = useState(null);

  // LE PEDI A CLAUDIA QUE COMENTE TODO EL CODIGO

  // --------------------------------------------------
  // Algoritmo de Aproximación de Vogel (VAM) - MEJORADO
  // --------------------------------------------------
  function vogelMethod(costs, supply, demand) {
    // Crear copias para no modificar los originales
    supply = [...supply];
    demand = [...demand];
    costs = costs.map((row) => [...row]);

    const m = supply.length;
    const n = demand.length;

    // Matriz de asignación inicial en ceros
    const allocation = Array.from({ length: m }, () => Array(n).fill(0));

    // Control de filas y columnas activas
    const rowActive = Array(m).fill(true);
    const colActive = Array(n).fill(true);

    // Función para calcular penalización (diferencia entre dos menores costos)
    function penalty(values) {
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

  // --------------------------------------------------
  // Calcular costo total
  // --------------------------------------------------
  function calcularCostoTotal(asignacion, costos) {
    let total = 0;
    for (let i = 0; i < asignacion.length; i++) {
      for (let j = 0; j < asignacion[0].length; j++) {
        total += asignacion[i][j] * costos[i][j];
      }
    }
    return total;
  }

  // --------------------------------------------------
  // Ejecutar Vogel
  // --------------------------------------------------
  const handleCalcular = (datos) => {
    const { costos, ofertas, demandas } = datos;

    const resultado = vogelMethod(costos, ofertas, demandas);
    const costo = calcularCostoTotal(resultado, costos);

    setResultado(resultado);
    setCostoTotal(costo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-indigo-900 dark:to-blue-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
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

        {/* Resultado */}
        {resultado && (
          <div className="mt-10 p-6 rounded-xl bg-white dark:bg-gray-800 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-600 dark:text-indigo-300">
              Resultado de la tabla de asignación (Vogel)
            </h2>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-indigo-100 dark:bg-indigo-900">
                    <th className="border p-3 dark:border-gray-700">
                      Origen/Destino
                    </th>
                    {resultado[0].map((_, j) => (
                      <th key={j} className="border p-3 dark:border-gray-700">
                        Destino {j + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultado.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="border p-3 font-semibold bg-indigo-50 dark:bg-indigo-900 dark:border-gray-700">
                        Origen {i + 1}
                      </td>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={`border p-3 text-center dark:border-gray-700 ${
                            cell > 0
                              ? "bg-green-100 dark:bg-green-900 font-bold"
                              : ""
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Costo total */}
            <div className="bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900 p-4 rounded-lg">
              <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                Nivel de Afinidad y Conocimiento Total:{" "}
                <span className="text-green-600 dark:text-green-400 text-2xl">
                  {costoTotal.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Vogel;

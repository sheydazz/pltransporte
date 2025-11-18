'use client';
import React from 'react';
import Link from 'next/link';
import ConfiguracionTransporte, { DatosTransporte } from '../components/ConfiguracionTransporte';

function Esquina() {
  const handleCalcular = (datos: DatosTransporte) => {
    console.log('Datos recibidos:', datos);
    // Aquí implementaremos el algoritmo de la Esquina Noroeste
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Método de la Esquina Noroeste
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Ingrese los datos del problema de transporte</p>
        </div>

        <ConfiguracionTransporte 
          onCalcular={handleCalcular}
          colorPrimario="blue"
          colorSecundario="purple"
        />
      </div>
    </div>
  );
}

export default Esquina;
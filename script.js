let NombreCompleto = ""
let edad = "0"
let tipoDocumento = ""
let numeroDocumento = ""
let salario = 0; 
let comisiones = 0; 
let horasExtra = 0; 
const ClasificaciónDeRiesgo1 = "Mínimo" 
const ClasificaciónDeRiesgo2 = "Bajo"
const ClasificaciónDeRiesgo3 = "Medio"
const ClasificaciónDeRiesgo4 = "Alto"
const ClasificaciónDeRiesgo5 = "Maximo"

//Operaciones//validación del peril

function validarPerfil(edad) {
  if (edad < 18)  return "menor_de_edad";      // No puede seguir
  if (edad < 25)  return "beneficiario";        // Clasificado como beneficiario por cotizante
  if (edad >= 60) return "pensionado";          // Solo calcula pensión
  return "activo";                              // Flujo normal
}

// ─── PASO 3: CÁLCULO DE OBLIGACIONES ──────────────────────────────
function calcularNomina(salario, comisiones, horasExtra, nivelRiesgo, esPensionado) {

  // Total devengado (sin auxilio de transporte)
  const totalDevengado = salario + comisiones + horasExtra;

  // IBC = 70% del total devengado
  const ibc = totalDevengado * 0.70;

  // Auxilio de transporte: solo si salario ≤ 2 SMLV
  const auxilioTransporte = salario <= 2 * SMLV ? SUBSIDIO_TRANSPORTE : 0;

  // Total ingresos (lo que aparece en el desprendible)
  const totalIngresos = totalDevengado + auxilioTransporte;

  // Deducciones
  const salud       = esPensionado ? 0 : ibc * 0.04;
  const pension     = ibc * 0.04;
  const solidaridad = ibc >= 4 * SMLV ? ibc * 0.01 : 0;  // Fondo de Solidaridad
  const arl         = esPensionado ? 0 : ibc * ARL_TARIFAS[nivelRiesgo];
  const retencion   = esPensionado ? 0 : calcularRetencion(totalIngresos, salud, pension);

  const totalDeducciones = salud + pension + solidaridad + arl + retencion;
  const neto = totalIngresos - totalDeducciones;

  return { totalDevengado, ibc, auxilioTransporte, totalIngresos,
           salud, pension, solidaridad, arl, retencion,
           totalDeducciones, neto };
}
// ─── RETENCIÓN EN LA FUENTE ─────────────────────────
function calcularRetencion(totalIngresos, salud, pension) {
  // Ingresos no constitutivos de renta
  const ingresosNoCR = salud + pension;

  // Rentas exentas: 25% del ingreso neto, máximo 420 UVT/mes
  const baseRentasExentas = totalIngresos - ingresosNoCR;
  const rentasExentas = Math.min(baseRentasExentas * 0.25, 420 * UVT);

  // Ingreso laboral gravado
  const gravado    = Math.max(0, totalIngresos - ingresosNoCR - rentasExentas);
  const gravadoUVT = gravado / UVT;

  let retencion = 0;
  if      (gravadoUVT <= 95)   retencion = 0;
  else if (gravadoUVT <= 150)  retencion = (gravadoUVT - 95)   * 0.19 * UVT;
  else if (gravadoUVT <= 360)  retencion = ((gravadoUVT - 150) * 0.28 + 10)  * UVT;
  else if (gravadoUVT <= 640)  retencion = ((gravadoUVT - 360) * 0.33 + 69)  * UVT;
  else if (gravadoUVT <= 945)  retencion = ((gravadoUVT - 640) * 0.35 + 162) * UVT;
  else if (gravadoUVT <= 2300) retencion = ((gravadoUVT - 945) * 0.37 + 268) * UVT;
  else                         retencion = ((gravadoUVT - 2300)* 0.39 + 770) * UVT;

  return Math.max(0, retencion);
}

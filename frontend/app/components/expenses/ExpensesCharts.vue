<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title
} from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

const api = useExpensesApi()

const props = defineProps<{
    params: { q?: string; category?: string }
}>()

const labels = ref<string[]>([])
const values = ref<number[]>([])
const loading = ref(false)

async function load() {
    loading.value = true
    try {
        // 👇 cambia al endpoint real que ya hiciste
        const res = await api.reportByCategory({
            q: props.params.q,
            category: props.params.category
        })

        labels.value = res.data.map((x: any) => x.category)
        values.value = res.data.map((x: any) => Number(x.total || 0))
    } finally {
        loading.value = false
    }
}

watch(
    () => [props.params.q, props.params.category],
    () => load(),
    { immediate: true }
)

const chartData = computed(() => ({
    labels: labels.value,
    datasets: [{ label: 'Gastos', data: values.value }]
}))

const options = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } }
}))
</script>

<template>
    <UCard>
        <template #header>Gastos por categoría</template>

        <div class="h-72">
            <ClientOnly>
                <Bar v-if="!loading" :data="chartData" :options="options" />
                <div v-else class="h-full flex items-center justify-center opacity-60 text-sm">
                    Cargando gráfica…
                </div>
            </ClientOnly>
        </div>
    </UCard>
</template>
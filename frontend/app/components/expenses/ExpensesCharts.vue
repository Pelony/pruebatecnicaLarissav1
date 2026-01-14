<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    BarElement,
    BarController,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title
} from 'chart.js'

ChartJS.register(
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title
)

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
        const res = await api.reportByCategory({
            q: props.params.q,
            category: props.params.category
        })

        labels.value = (res.data ?? []).map((x: any) => String(x.category ?? 'other'))
        values.value = (res.data ?? []).map((x: any) => {
            const n = Number(x.total)
            return Number.isFinite(n) ? n : 0
        })
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
    datasets: [
        {
            label: 'Gastos',
            data: values.value,
            backgroundColor: 'rgba(59, 130, 246, 0.6)', // azul
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
        }
    ]
}))

const options = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } }
}))

const chartKey = computed(() => `${labels.value.join('|')}::${values.value.join('|')}`)
</script>

<template>
    <UCard>
        <template #header>Gastos por categoría</template>

        <div class="h-72 w-full relative">
            <ClientOnly>
                <Bar v-if="!loading" :key="chartKey" :data="chartData" :options="options" />
                <div v-else class="h-full flex items-center justify-center opacity-60 text-sm">
                    Cargando gráfica…
                </div>
            </ClientOnly>
        </div>

        <!-- Debug temporal -->
        <div class="text-xs opacity-70 mt-2">
            labels: {{ labels.length }} | values: {{ values.length }}
        </div>
    </UCard>
</template>
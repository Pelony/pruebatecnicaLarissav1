<script setup lang="ts">
import { computed } from 'vue'

export type FiltersState = {
    q?: string
    category?: string
    dateFrom?: string // YYYY-MM-DD
    dateTo?: string   // YYYY-MM-DD
    groupBy: 'day' | 'month'
    top: number
}

const props = defineProps<{
    categories: string[]
    loading?: boolean
}>()

const model = defineModel<FiltersState>('modelValue', {
    default: () => ({
        q: undefined,
        category: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        groupBy: 'month',
        top: 10,
    }),
})

// --- category select (evita empty string) ---
const ALL = '__all__'

const categoryOptions = computed(() => {
    const base = [{ label: 'Todas las categorías', value: ALL }]
    const cats = (props.categories ?? [])
        .filter(Boolean)
        .map((c) => ({ label: c, value: c }))
    return [...base, ...cats]
})

const categoryProxy = computed<string>({
    get() {
        return model.value.category ?? ALL
    },
    set(v) {
        model.value.category = v === ALL ? undefined : v
    },
})

const groupByOptions = [
    { label: 'Por día', value: 'day' },
    { label: 'Por mes', value: 'month' },
]

const topOptions = [5, 10, 15, 20, 50].map((n) => ({
    label: `Top ${n}`,
    value: n,
}))

function clear() {
    model.value = {
        q: undefined,
        category: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        groupBy: 'month',
        top: 10,
    }
}
</script>

<template>
    <UCard>
        <template #header>
            <div class="flex items-center justify-between gap-2">
                <div class="font-semibold">Filtros</div>
                <UButton variant="ghost" icon="i-lucide-x" @click="clear">
                    Limpiar
                </UButton>
            </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div class="md:col-span-5">
                <UFormField label="Buscar">
                    <UInput v-model="model.q" placeholder="Descripción o categoría…" icon="i-lucide-search" />
                </UFormField>
            </div>

            <div class="md:col-span-4">
                <UFormField label="Categoría">
                    <USelect v-model="categoryProxy" :options="categoryOptions" :loading="loading" />
                </UFormField>
            </div>

            <div class="md:col-span-3">
                <UFormField label="Agrupar reportes">
                    <USelect v-model="model.groupBy" :options="groupByOptions" />
                </UFormField>
            </div>

            <div class="md:col-span-3">
                <UFormField label="Desde">
                    <UInput v-model="model.dateFrom" type="date" />
                </UFormField>
            </div>

            <div class="md:col-span-3">
                <UFormField label="Hasta">
                    <UInput v-model="model.dateTo" type="date" />
                </UFormField>
            </div>

            <div class="md:col-span-3">
                <UFormField label="Top categorías">
                    <USelect v-model="model.top" :options="topOptions" />
                </UFormField>
            </div>

            <div class="md:col-span-3 flex items-end justify-end gap-2">
                <UButton variant="soft" icon="i-lucide-refresh-cw" :loading="loading" @click="$emit('refresh')">
                    Aplicar
                </UButton>
            </div>
        </div>
    </UCard>
</template>
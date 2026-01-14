<script setup lang="ts">
    import type { Expense, ExpenseCreate, ExpenseUpdate } from '~/types/expense'
    import ExpensesTable from '~/components/expenses/ExpensesTable.vue'
    import ExpenseFormModal from '~/components/expenses/ExpenseFormModal.vue'
    import DeleteConfirmModal from '~/components/expenses/DeleteConfirmModal.vue'
    import type { ListExpensesParams } from '~/composables/useExpensesApi'
    
    const api = useExpensesApi()
    const toast = useToast()
    
    const rows = ref<Expense[]>([])
    const total = ref(0)
    const sumAmount = ref('0') // 👈 NUEVO
    
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const errorMsg = ref<string | null>(null)
    
    // Server-side query state (la fuente de verdad)
    const queryState = ref<ListExpensesParams>({
      page: 1,
      pageSize: 10,
      q: undefined,
      category: undefined,
      sortBy: 'date',
      sortDir: 'DESC',
    })
    
    const isFormOpen = ref(false)
    const formMode = ref<'create' | 'edit'>('create')
    const selected = ref<Expense | null>(null)
    
    const isDeleteOpen = ref(false)
    const selectedToDelete = ref<Expense | null>(null)
    
    async function load(state: ListExpensesParams = queryState.value) {
      loading.value = true
      errorMsg.value = null
      try {
        const res = await api.list(state)
        rows.value = res.data
        total.value = res.total
        sumAmount.value = res.sumAmount ?? '0'
        queryState.value = { ...queryState.value, ...state }
      } catch (e: any) {
        errorMsg.value = e?.data?.message || e?.message || 'Error cargando gastos'
      } finally {
        loading.value = false
      }
    }
    
    function onQueryChange(next: {
      page: number
      pageSize: number
      q?: string
      category?: string
      sortBy?: 'date' | 'amount' | 'category' | 'description'
      sortDir?: 'ASC' | 'DESC'
    }) {
      queryState.value = { ...queryState.value, ...next }
      load(queryState.value)
    }
    
    function openCreate() {
      formMode.value = 'create'
      selected.value = null
      isFormOpen.value = true
    }
    
    function openEdit(row: Expense) {
      formMode.value = 'edit'
      selected.value = row
      isFormOpen.value = true
    }
    
    function openDelete(row: Expense) {
      selectedToDelete.value = row
      isDeleteOpen.value = true
    }
    
    watch(isFormOpen, (v) => {
      if (!v && formMode.value === 'create') selected.value = null
    })
    
    watch(isDeleteOpen, (v) => {
      if (!v) selectedToDelete.value = null
    })
    
    async function onSubmit(payload: ExpenseCreate | ExpenseUpdate) {
      saving.value = true
      errorMsg.value = null
      try {
        if (formMode.value === 'create') {
          await api.create(payload as ExpenseCreate)
          toast.add({ title: 'Gasto creado', description: 'Se guardó correctamente.' })
        } else {
          if (!selected.value) return
          await api.update(selected.value.id, payload as ExpenseUpdate)
          toast.add({ title: 'Gasto actualizado', description: 'Cambios guardados.' })
        }
    
        isFormOpen.value = false
        await load(queryState.value) // 👈 recarga con el mismo estado (página/filtros/sort)
      } catch (e: any) {
        errorMsg.value = e?.data?.message || e?.message || 'No se pudo guardar'
        toast.add({ title: 'Error', description: String(errorMsg.value), color: 'red' })
      } finally {
        saving.value = false
      }
    }
    
    async function confirmDelete() {
      if (!selectedToDelete.value) return
      deleting.value = true
      errorMsg.value = null
      try {
        await api.remove(selectedToDelete.value.id)
        toast.add({ title: 'Gasto eliminado' })
        isDeleteOpen.value = false
        selectedToDelete.value = null
    
        // Si borraste el último item de una página, opcionalmente baja una página
        // (esto evita quedarte en una página vacía)
        const remaining = rows.value.length - 1
        if (remaining <= 0 && (queryState.value.page ?? 1) > 1) {
          queryState.value.page = (queryState.value.page ?? 1) - 1
        }
    
        await load(queryState.value)
      } catch (e: any) {
        errorMsg.value = e?.data?.message || e?.message || 'No se pudo eliminar'
        toast.add({ title: 'Error', description: String(errorMsg.value), color: 'red' })
      } finally {
        deleting.value = false
      }
    }
    
    onMounted(() => load(queryState.value))
    </script>
    
    <template>
      <div class="p-6 max-w-6xl mx-auto space-y-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-semibold">Gastos</h1>
            <p class="text-sm opacity-70">Gestor básico de gastos</p>
          </div>
    
          
        </div>
    
        <UAlert v-if="errorMsg" color="red" variant="soft" :title="String(errorMsg)" />
    
        <ExpensesTable
          :rows="rows"
          :total="total"
          :loading="loading"
          :sum-amount="sumAmount"
          @queryChange="onQueryChange"
          @refresh="() => load(queryState)"
          @create="openCreate"
          @edit="openEdit"
          @delete="openDelete"
        />
    
        <ExpenseFormModal
          v-model:open="isFormOpen"
          :mode="formMode"
          :initial="selected"
          :saving="saving"
          @submit="onSubmit"
        />
    
        <DeleteConfirmModal
          v-model:open="isDeleteOpen"
          :loading="deleting"
          title="Eliminar gasto"
          message="¿Seguro que deseas eliminar este gasto?"
          @confirm="confirmDelete"
        />
      </div>
    </template>
    
<script setup lang="ts">
    import type { Expense, ExpenseCreate, ExpenseUpdate } from '~/types/expense'
    
    const api = useExpensesApi()
    
    const rows = ref<Expense[]>([])
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const errorMsg = ref<string | null>(null)
    
    const isFormOpen = ref(false)
    const formMode = ref<'create' | 'edit'>('create')
    const selected = ref<Expense | null>(null)
    
    const isDeleteOpen = ref(false)
    const selectedToDelete = ref<Expense | null>(null)
    
    async function loadAll() {
      loading.value = true
      errorMsg.value = null
      try {
        const res = await api.list()
        rows.value = res.data
      } catch (e: any) {
        errorMsg.value = e?.data?.message || e?.message || 'Error cargando gastos'
      } finally {
        loading.value = false
      }
    }
    
    async function onSearch(query: string) {
      const q = query.trim()
      if (!q) return loadAll()
    
      loading.value = true
      errorMsg.value = null
      try {
        const res = await api.search(q)
        rows.value = res.data
      } catch (e: any) {
        errorMsg.value = e?.data?.message || e?.message || 'Error en búsqueda'
      } finally {
        loading.value = false
      }
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
    
    async function onSubmit(payload: ExpenseCreate | ExpenseUpdate) {
      saving.value = true
      errorMsg.value = null
      try {
        if (formMode.value === 'create') {
          await api.create(payload as ExpenseCreate)
        } else {
          if (!selected.value) return
          await api.update(selected.value.id, payload as ExpenseUpdate)
        }
        isFormOpen.value = false
        await loadAll()
      } catch (e: any) {
        errorMsg.value = e?.data?.message || e?.message || 'No se pudo guardar'
      } finally {
        saving.value = false
      }
    }
    
    function openDelete(row: Expense) {
      selectedToDelete.value = row
      isDeleteOpen.value = true
    }
    
    async function confirmDelete() {
      if (!selectedToDelete.value) return
      deleting.value = true
      errorMsg.value = null
      try {
        await api.remove(selectedToDelete.value.id)
        isDeleteOpen.value = false
        selectedToDelete.value = null
        await loadAll()
      } catch (e: any) {
        errorMsg.value = e?.data?.message || e?.message || 'No se pudo eliminar'
      } finally {
        deleting.value = false
      }
    }
    
    onMounted(loadAll)
    </script>
    
    <template>
      <div class="p-6 max-w-6xl mx-auto space-y-4">
        <div>
          <h1 class="text-2xl font-semibold">Gastos</h1>
          <p class="text-sm text-muted-foreground">Gestor básico (Nuxt UI + API Nest)</p>
        </div>
    
        <UAlert v-if="errorMsg" color="red" variant="soft" :title="String(errorMsg)" />
    
        <ExpensesTable
          :rows="rows"
          :loading="loading"
          @create="openCreate"
          @edit="openEdit"
          @delete="openDelete"
          @search="onSearch"
          @refresh="loadAll"
        />
    
        <ExpenseFormModal
          v-model="isFormOpen"
          :mode="formMode"
          :initial="selected"
          :saving="saving"
          @submit="onSubmit"
        />
    
        <DeleteConfirmModal
          v-model="isDeleteOpen"
          :loading="deleting"
          title="Eliminar gasto"
          message="¿Seguro que deseas eliminar este gasto?"
          @confirm="confirmDelete"
        />
      </div>

    </template>
    
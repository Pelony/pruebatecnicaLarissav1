<script setup lang="ts">
    import type { Expense, ExpenseCreate, ExpenseUpdate } from '~/types/expense'
    
    const props = defineProps<{
      modelValue: boolean
      mode: 'create' | 'edit'
      initial?: Expense | null
      saving?: boolean
    }>()
    
    const emit = defineEmits<{
      (e: 'update:modelValue', v: boolean): void
      (e: 'submit', payload: ExpenseCreate | ExpenseUpdate): void
    }>()
    
    const open = computed({
      get: () => props.modelValue,
      set: (v) => emit('update:modelValue', v),
    })
    
    const form = reactive({
      description: '',
      amount: 0,
      category: 'other',
    })
    
    watch(
      () => props.initial,
      (val) => {
        if (props.mode === 'edit' && val) {
          form.description = val.description
          form.amount = Number(val.amount)
          form.category = val.category
        } else {
          form.description = ''
          form.amount = 0
          form.category = 'other'
        }
      },
      { immediate: true },
    )
    
    function onSubmit() {
      if (props.mode === 'create') {
        emit('submit', {
          description: form.description,
          amount: form.amount,
          category: form.category,
        } satisfies ExpenseCreate)
      } else {
        emit('submit', {
          description: form.description,
          amount: form.amount,
          category: form.category,
        } satisfies ExpenseUpdate)
      }
    }
    </script>
    
    <template>
      <UModal v-model="open">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="font-semibold">
                {{ props.mode === 'create' ? 'Nuevo gasto' : 'Editar gasto' }}
              </div>
              <UButton icon="i-lucide-x" variant="ghost" @click="open=false" />
            </div>
          </template>
    
          <div class="space-y-3">
            <UFormGroup label="Descripción">
              <UInput v-model="form.description" placeholder="Ej. Uber, Café..." />
            </UFormGroup>
    
            <UFormGroup label="Monto">
              <UInput v-model.number="form.amount" type="number" step="0.01" />
            </UFormGroup>
    
            <UFormGroup label="Categoría">
              <UInput v-model="form.category" placeholder="food / transport / ..." />
            </UFormGroup>
          </div>
    
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" :disabled="props.saving" @click="open=false">Cancelar</UButton>
              <UButton :loading="props.saving" @click="onSubmit">
                {{ props.mode === 'create' ? 'Guardar' : 'Actualizar' }}
              </UButton>
            </div>
          </template>
        </UCard>
      </UModal>
    </template>
    
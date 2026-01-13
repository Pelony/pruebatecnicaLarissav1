<script setup lang="ts">
    const props = defineProps<{
      modelValue: boolean
      loading?: boolean
      title?: string
      message?: string
    }>()
    
    const emit = defineEmits<{
      (e: 'update:modelValue', v: boolean): void
      (e: 'confirm'): void
    }>()
    
    const open = computed({
      get: () => props.modelValue,
      set: (v) => emit('update:modelValue', v),
    })
    </script>
    
    <template>
      <UModal v-model="open">
        <UCard>
          <template #header>
            <div class="font-semibold">{{ props.title ?? 'Eliminar gasto' }}</div>
          </template>
    
          <p class="text-sm text-muted-foreground">
            {{ props.message ?? '¿Seguro que deseas eliminar este gasto? Esta acción no se puede deshacer.' }}
          </p>
    
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" :disabled="props.loading" @click="open=false">Cancelar</UButton>
              <UButton color="red" :loading="props.loading" @click="emit('confirm')">Eliminar</UButton>
            </div>
          </template>
        </UCard>
      </UModal>
    </template>
    
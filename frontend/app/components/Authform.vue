<script setup lang="ts">
const emit = defineEmits<{
    (e: 'submit', payload: { email: string; password: string }): Promise<void> | void
}>()

const loading = ref(false)
const success = ref(false)
const errorMsg = ref<string | null>(null)

const form = reactive({
    email: '',
    password: ''
})

async function onSubmit() {
    if (loading.value) return

    errorMsg.value = null
    success.value = false
    loading.value = true

    try {
        await emit('submit', {
            email: form.email.trim(),
            password: form.password
        })

        // ✅ login ok, el padre hará redirect
        success.value = true
    } catch (e: any) {
        errorMsg.value =
            e?.data?.message ||
            e?.message ||
            'No se pudo iniciar sesión'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UForm class="flex flex-col gap-8" @submit.prevent="onSubmit">
        <!-- 🔐 Inputs -->
        <div class="flex flex-col gap-4">
            <UFormGroup label="Email" name="email">
                <UInput v-model="form.email" type="email" placeholder="admin@demo.com" autocomplete="email" size="lg"
                    :disabled="loading || success" />
            </UFormGroup>

            <UFormGroup label="Contraseña" name="password">
                <UInput v-model="form.password" type="password" placeholder="••••••••" autocomplete="current-password"
                    size="lg" :disabled="loading || success" />
            </UFormGroup>
        </div>

        <!-- 💬 Feedback -->
        <div class="min-h-[52px]">
            <!-- loading -->
            <div v-if="loading && !success" class="flex items-center gap-2 text-sm text-muted">
                <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin text-primary" />
                <span>Verificando credenciales…</span>
            </div>

            <!-- success -->
            <div v-else-if="success" class="flex items-center gap-2 text-sm text-green-600">
                <UIcon name="i-lucide-check-circle" class="size-4" />
                <span>Sesión iniciada, redirigiendo…</span>
            </div>

            <!-- error -->
            <UAlert v-else-if="errorMsg" color="red" variant="soft" :title="errorMsg" icon="i-lucide-alert-triangle" />
        </div>

        <!-- 🚀 Acción -->
        <UButton type="submit" size="lg" block :loading="loading" :disabled="success"
            :icon="success ? 'i-lucide-check' : 'i-lucide-log-in'">
            <span v-if="!loading && !success">Entrar</span>
            <span v-else-if="loading">Entrando…</span>
            <span v-else>Listo</span>
        </UButton>
    </UForm>
</template>
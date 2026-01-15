<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const route = useRoute()
const router = useRouter()
const { login } = useAuth()

const redirecting = ref(false)

async function handleSubmit(payload: { email: string; password: string }) {
    await login(payload.email, payload.password)

    redirecting.value = true

    const next = typeof route.query.next === 'string' ? route.query.next : '/'
    await router.replace(next)
}
</script>


<template>
    <div class="min-h-screen flex items-center justify-center p-6">
        <div class="relative w-full max-w-md">
            <UCard>
                <template #header>
                    <div class="space-y-1">
                        <h1 class="text-xl font-semibold">Iniciar sesión</h1>
                        <p class="text-sm text-muted">
                            Accede para ver tus gastos.
                        </p>
                    </div>
                </template>

                <Authform @submit="handleSubmit" />
            </UCard>

            <!-- 🔄 Overlay de redirección -->
            <div v-if="redirecting" class="absolute inset-0 bg-background/80 backdrop-blur-sm
                     flex items-center justify-center z-50 rounded-lg">
                <div class="flex items-center gap-3 text-sm">
                    <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin text-primary" />
                    <span>Sesión iniciada, redirigiendo…</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
    import type { NavigationMenuItem } from '@nuxt/ui'
    import { useAuthStore } from '~/stores/auth'
    
    const route = useRoute()
    const auth = useAuthStore()
    const { logout } = useAuth()
    
    const items = computed<NavigationMenuItem[][]>(() => [
      [
        { label: 'Gastos', icon: 'i-lucide-receipt', to: '/', active: route.path === '/' },
        { label: 'Categorías', icon: 'i-lucide-tags', to: '/categories', active: route.path.startsWith('/categories') },
        { label: 'Reportes', icon: 'i-lucide-bar-chart-3', to: '/reports', active: route.path.startsWith('/reports') },
      ],
      [
        {
          label: 'Salir',
          icon: 'i-lucide-log-out',
          click: async () => {
            await logout()
            await navigateTo('/login')
          }
        }
      ]
    ])
    </script>
    
    <template>
      <!-- DashboardGroup = layout fijo del dashboard -->
      <UDashboardGroup>
        <!-- OJO: con resizable, envuelve si necesitas layout sólido -->
        <div class="flex flex-1">
          <UDashboardSidebar
            collapsible
            resizable
            :ui="{ footer: 'border-t border-default' }"
          >
            <template #header="{ collapsed }">
              <div class="flex items-center gap-2 w-full">
                <UIcon
                  name="i-lucide-wallet"
                  class="size-5 text-primary"
                  :class="[collapsed ? 'mx-auto' : '']"
                />
                <span v-if="!collapsed" class="font-semibold">Expense Tracker</span>
              </div>
            </template>
    
            <template #default="{ collapsed }">
              <UNavigationMenu
                :collapsed="collapsed"
                :items="items[0]"
                orientation="vertical"
                class="mt-3"
              />
    
              <UNavigationMenu
                :collapsed="collapsed"
                :items="items[1]"
                orientation="vertical"
                class="mt-auto"
              />
            </template>
    
            <template #footer="{ collapsed }">
              <UButton
                :label="collapsed ? undefined : (auth.user?.email ?? 'Cuenta')"
                color="neutral"
                variant="ghost"
                class="w-full"
                :block="collapsed"
                icon="i-lucide-user-circle"
              />
            </template>
          </UDashboardSidebar>
    
          <!-- Panel principal -->
          <UDashboardPanel id="main" class="flex-1">
            <!-- Usa slots header/body según docs -->
            <template #header>
              <UDashboardNavbar />
            </template>
    
            <template #body>
              <!-- aquí sí o sí queda tu index.vue dentro -->
              <div class="h-full overflow-auto p-6">
                <slot />
              </div>
            </template>
          </UDashboardPanel>
        </div>
      </UDashboardGroup>
    </template>
    
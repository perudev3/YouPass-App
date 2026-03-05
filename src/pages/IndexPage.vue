<template>
  <q-page class="home">

    <!-- CAROUSEL -->
    <q-carousel
      v-if="!modoFiesta"
      v-model="slide"
      animated
      swipeable
      infinite
      autoplay
      height="210px"
      class="banner-carousel"
    >
      <q-carousel-slide
        v-for="event in featuredEvents"
        :key="event.id"
      >
        <img :src="event.image" class="banner-img" />
      </q-carousel-slide>
    </q-carousel>

    <!-- SEARCH -->
    <div v-if="!modoFiesta" class="search-wrapper">
      <div class="search-box">
        <q-input
          v-model="search"
          dense
          borderless
          placeholder="Buscar en YouPass"
          class="search-input"
        />
        <q-btn unelevated label="Buscar" class="search-btn" />
      </div>
    </div>

    <!-- ===============================
         MODO FIESTA BAR
    =============================== -->
    <div v-if="modoFiesta && selectedEvent" class="fiesta-bar">

      <div class="fiesta-header">
        🍾 Barra - {{ selectedEvent?.name }}
      </div>

      <div class="fiesta-buttons">

        <q-btn
          class="fiesta-btn"
          icon="local_bar"
          label="Bebidas"
          unelevated
          @click="goCategory('bebidas')"
        />

        <q-btn
          class="fiesta-btn"
          icon="emoji_food_beverage"
          label="Coctelería"
          unelevated
          @click="goCategory('cocteleria')"
        />

        <q-btn
          class="fiesta-btn"
          icon="liquor"
          label="Destilados"
          unelevated
          @click="goCategory('destilados')"
        />

      </div>

    </div>

    <!-- ===============================
         EVENTOS
    =============================== -->
    <div
      class="events-scroll"
    >
      <q-card
        v-for="event in filteredEvents"
        :key="event.id"
        class="event-card q-mb-md"
        flat
      >
        <div class="row no-wrap">
          <img :src="event.image" class="event-thumb" />

          <div class="q-pa-sm column justify-between col">
            <div>
              <div class="event-title">{{ event.name }}</div>
              <div class="event-sub">
                {{ event.date }} · {{ event.location }}
              </div>
            </div>

            <q-btn
              dense
              unelevated
              class="buy-btn"
              :label="modoFiesta ? 'Barra' : 'Comprar'"
              @click="modoFiesta ? openBar(event) : buyTicket(event.id)"
            />
          </div>
        </div>
      </q-card>
    </div>


    <q-dialog v-model="barModal">

      <q-card style="width:350px;background:#020617;color:white">

        <q-card-section class="text-h6">
          🍾 {{ categorySelected }}
        </q-card-section>

        <q-separator />

        <q-card-section>

          <div v-if="barItems.length === 0" class="text-grey text-center">
            No hay productos
          </div>

          <q-list v-else>

            <q-item
              v-for="item in barItems"
              :key="item.id"
              clickable
              @click="buyDrink(item)"
            >

              <q-item-section avatar>
                <img
                  :src="item.image"
                  style="width:40px;height:40px;border-radius:8px"
                />
              </q-item-section>

              <q-item-section>
                {{ item.name }}
              </q-item-section>

              <q-item-section side>
                S/ {{ item.price }}
              </q-item-section>

            </q-item>

          </q-list>

        </q-card-section>

      </q-card>

    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import Swal from 'sweetalert2'

const router = useRouter()

const slide = ref(0)
const modoFiesta = ref(false)

const featuredEvents = ref([])
const loading = ref(false)

const barItems = ref([])

const search = ref('')

const filteredEvents = computed(() => {

  if (!search.value) {
    return featuredEvents.value
  }

  return featuredEvents.value.filter(event =>
    event.name.toLowerCase().includes(search.value.toLowerCase()) ||
    event.location.toLowerCase().includes(search.value.toLowerCase())
  )

})

const barModal = ref(false)
const selectedEvent = ref(null)
const categorySelected = ref(null)

const loadEvents = async () => {

  loading.value = true
  const token = localStorage.getItem('token')

  try {

    let res

    if (modoFiesta.value) {

      res = await api.get('/auth/my-tickets',{
        headers:{ Authorization:`Bearer ${token}` }
      })

      const events = res.data.map(ticket => ticket.event)

      featuredEvents.value = [...new Map(events.map(e => [e.id, e])).values()]

    } else {

      res = await api.get('/auth/events',{
        headers:{ Authorization:`Bearer ${token}` }
      })

      featuredEvents.value = res.data

    }

  } catch (error) {

    console.error('Error cargando eventos',error)

  } finally {

    loading.value = false

  }

}

const loadBarItems = async (cat) => {

  try {

    const token = localStorage.getItem('token')

    const res = await api.get(`/auth/event-bar/${selectedEvent.value.id}/${cat}`,{
      headers:{ Authorization:`Bearer ${token}` }
    })

    barItems.value = res.data

    categorySelected.value = cat

    barModal.value = true

  } catch (error) {

    console.error('Error cargando barra',error)

  }

}

const buyDrink = async (item) => {

  try {

    const token = localStorage.getItem('token')

    const res = await api.post('/auth/bar/buy',{
      event_id: selectedEvent.value.id,
      bar_item_id: item.id
    },{
      headers:{ Authorization:`Bearer ${token}` }
    })

    const order = res.data.order

    await Swal.fire({
      title:'🍾 Pedido realizado',
      html:`
        <p>Muestra este QR en la barra</p>
        <img src="${order.qr}" style="width:200px"/>
      `,
      confirmButtonText:'OK'
    })

  } catch(error) {

    console.log(error)

    Swal.fire(
      'Error',
      'No se pudo realizar la compra',
      'error'
    )

  }

}

const buyTicket = (id) => {
  router.push(`/event/${id}`)
}

const goCategory = (cat) => {

  if (!selectedEvent.value) {
    console.log('No hay evento seleccionado')
    return
  }

  loadBarItems(cat)

}
/* =====================================
   ESCUCHAR CAMBIO DE MODO FIESTA
===================================== */

const handleModoFiesta = (event) => {

  modoFiesta.value = event.detail

  loadEvents()

}

const openBar = (event) => {

  selectedEvent.value = event

  console.log('Evento seleccionado:', event)

}

onMounted(() => {

  const savedModo = localStorage.getItem('modoFiesta')

  if (savedModo !== null) {
    modoFiesta.value = savedModo === 'true'
  }

  loadEvents()

  window.addEventListener(
    'modo-fiesta-changed',
    handleModoFiesta
  )

})

onUnmounted(() => {

  window.removeEventListener(
    'modo-fiesta-changed',
    handleModoFiesta
  )

})
</script>

<style scoped>
.home {
  background: #0b0f19;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* CAROUSEL */
.banner-carousel {
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* SEARCH */
.search-wrapper {
  position: sticky;
  top: 56px;
  z-index: 15;
  background: #0b0f19;
  padding: 12px;
}

.search-box {
  display: flex;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding-left: 12px;
}

.search-btn {
  background: #facc15;
  color: #020617;
  font-weight: 700;
  border-radius: 0;
}

/* EVENTS */
.events-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.event-card {
  background: #020617;
  border-radius: 14px;
  color: white;
}

.event-thumb {
  width: 120px;
  object-fit: cover;
  border-radius: 14px 0 0 14px;
}

.event-title {
  font-weight: 800;
  font-size: 0.95rem;
}

.event-sub {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 6px;
}

.buy-btn {
  background: #2563eb;
  color: white;
  font-weight: 700;
  border-radius: 10px;
}

/* ==========================
   MODO FIESTA BAR
========================== */

.fiesta-bar {
  padding: 20px;
}

.fiesta-header {
  font-size: 1.2rem;
  font-weight: 800;
  color: #FFC220;
  margin-bottom: 14px;
}

.fiesta-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fiesta-btn {
  background: #020617;
  color: white;
  font-weight: 700;
  border-radius: 12px;
  height: 52px;
}

.fiesta-btn:hover {
  background: #1f2937;
}
</style>
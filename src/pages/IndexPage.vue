<template>
  <q-page class="home">

    <!-- CAROUSEL -->
    <q-carousel
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
    <div class="search-wrapper">
      <div class="search-box">
        <q-input
          dense
          borderless
          placeholder="Buscar en YouPass"
          class="search-input"
        />
        <q-btn unelevated label="Buscar" class="search-btn" />
      </div>
    </div>

    <!-- EVENTS -->
    <div class="events-scroll">
      <q-card
        v-for="event in featuredEvents"
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
              label="Comprar"
              @click="buyTicket(event.id)"
            />
          </div>
        </div>
      </q-card>
    </div>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const slide = ref(0)




const featuredEvents = ref([
  {
    id: 1,
    name: 'Concierto Pop 2026',
    date: '24 Ene 2026',
    location: 'Estadio Nacional',
    image: 'https://source.unsplash.com/600x400/?concert'
  },
  {
    id: 1,
    name: 'Concierto Pop 2026',
    date: '24 Ene 2026',
    location: 'Estadio Nacional',
    image: 'https://source.unsplash.com/600x400/?concert'
  },
  {
    id: 1,
    name: 'Concierto Pop 2026',
    date: '24 Ene 2026',
    location: 'Estadio Nacional',
    image: 'https://source.unsplash.com/600x400/?concert'
  },
  {
    id: 1,
    name: 'Concierto Pop 2026',
    date: '24 Ene 2026',
    location: 'Estadio Nacional',
    image: 'https://source.unsplash.com/600x400/?concert'
  },
  {
    id: 1,
    name: 'Concierto Pop 2026',
    date: '24 Ene 2026',
    location: 'Estadio Nacional',
    image: 'https://source.unsplash.com/600x400/?concert'
  },
  {
    id: 1,
    name: 'Concierto Pop 2026',
    date: '24 Ene 2026',
    location: 'Estadio Nacional',
    image: 'https://source.unsplash.com/600x400/?concert'
  },
  {
    id: 1,
    name: 'Concierto Pop 2026',
    date: '24 Ene 2026',
    location: 'Estadio Nacional',
    image: 'https://source.unsplash.com/600x400/?concert'
  },
  {
    id: 1,
    name: 'Concierto Pop 2026',
    date: '24 Ene 2026',
    location: 'Estadio Nacional',
    image: 'https://source.unsplash.com/600x400/?concert'
  },
  {
    id: 1,
    name: 'Concierto Pop 2026',
    date: '24 Ene 2026',
    location: 'Estadio Nacional',
    image: 'https://source.unsplash.com/600x400/?concert'
  },
  {
    id: 1,
    name: 'Concierto Pop 2026',
    date: '24 Ene 2026',
    location: 'Estadio Nacional',
    image: 'https://source.unsplash.com/600x400/?concert'
  },
  {
    id: 1,
    name: 'Concierto Pop 2026',
    date: '24 Ene 2026',
    location: 'Estadio Nacional',
    image: 'https://source.unsplash.com/600x400/?concert'
  },
])

const buyTicket = (id) => {
  router.push(`/event/${id}`)
}
</script>


<style scoped>
.home {
  background: #0b0f19;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* HEADER */
.top-bar {
  height: 56px;
  background: #020617;
  color: white;
  position: sticky;
  top: 0;
  z-index: 20;
}

.logo {
  font-weight: 900;
  font-size: 1.2rem;
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

/* EVENTS SCROLL */
.events-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

/* EVENT CARD */
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

/* DRAWER */
.drawer {
  background: #020617;
  color: white;
}

.drawer-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.drawer-logo {
  font-weight: 900;
  font-size: 1.4rem;
}

</style>

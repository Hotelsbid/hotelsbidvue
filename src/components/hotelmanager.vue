<template>
  <div>
    <div style="display: flex; width: 100%; margin-bottom: 40px;align-items: center;justify-content: space-between;">
      <div style="text-align: left;">
        <h1 style="margin-bottom: 0;">Hotelsbid - групповое бронирование отелей</h1>
        <span style="margin-bottom: 0;"class="tag">Пользователь: {{ user }}</span>
      </div>
      <button @click="logout">Выход</button>
    </div>
    <form @submit.prevent="filterEnable" class="form-search">
      <input
        type="search"
        v-model="search"
        placeholder="Enter text to search"
      />
      <button type="submit" class="search">Поиск</button>
    </form>

    <ul>
      <li v-for="request, index in (filterEnabled ? requestListFiltered : requestList)" :key="request.id">
        <div>
        <div>
          {{ request.text }}
          <img :src="iconCopy" :class="['icon-copy', copiedIndex === index && copied ? 'copied' : '']" @click="copyToClipboard(request.ip_address, index)" />
        </div>
        <div><span @click="addHotel(request.id,user)">Отправить предложение</span></div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { supabase } from '../assets/js/supabase';
import iconCopy from '../assets/icons/copy.svg';

export default {
  data() {
    return {
      filterEnabled: false,
      search: '',
      user: '',
      requestList: [],
      requestListFiltered: [],
      newrequest: {
        text: ''
      },
      iconCopy: iconCopy,
      copied: false,
      copiedIndex: 0,
    };
  },
  created() {
    this.fetchrequest();
    supabase.auth.getUser().then((el) => {
      this.user = el.data.user.email;
    });
  },
  watch: {
    search(val) {
      if (!val) {
        this.filterEnabled = false;
      }
    },
  },
  methods: {
    async addHotel(requestId, hotelName) {
    const { data, error } = await supabase.from('requests').select('hotels').eq('id', requestId).single();
    if (error) {
      console.error('Error fetching hotels:', error);
      return;
    }

    const currentHotels = data.hotels || { hotels: [] };

    // Добавляем новое предложение от отеля
    if (!currentHotels.hotels.includes(hotelName)) {
      currentHotels.hotels.push(hotelName);
      console.log(currentHotels)
      const { error: updateError } = await supabase.from('requests').update({ hotels: currentHotels }).eq('id', requestId);
      if (updateError) {
        console.error('Error updating hotels:', updateError);
      } else {
        console.log(`Hotel ${hotelName} added to request ${requestId}`);
        this.fetchrequest(); // Обновить список запросов
      }
    } else {
      console.log('Это предложение от отеля уже существует');
    }
  },
    async fetchrequest() {
    const { data, error } = await supabase.from('requests').select('*');
    if (error) {
      console.error('Error fetching request:', error);
    } else {
      this.requestList = data;
    }

    const channels = supabase.channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' },
        (payload) => {
          console.log('Change received!', payload);
          const changeType = payload.eventType;
          const updatedRequest = payload.new;

          if (changeType === 'INSERT') {
            this.requestList.push(updatedRequest);
          } else if (changeType === 'UPDATE') {
            const index = this.requestList.findIndex(request => request.id === updatedRequest.id);
            if (index !== -1) {
              this.requestList[index] = updatedRequest;
            }
          } else if (changeType === 'DELETE') {
            this.requestList = this.requestList.filter(request => request.id !== payload.old.id);
          }
        }
      )
      .subscribe();
  },
    async logout() {
      console.log('Logging out');
      await supabase.auth.signOut();
      this.$router.push('/');
    },
    copyToClipboard(text, index) {
      this.copied = true;
      this.copiedIndex = index;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          console.log('Текст скопирован в буфер обмена:', text);
        }).catch(err => {
          console.error('Ошибка при копировании текста:', err);
        });
      } else {
        console.error('Clipboard API не поддерживается в этом браузере');
      }
      setTimeout(() => {
        this.copied = false;
      }, 500);
    },
    filterEnable() {
      this.requestListFiltered = this.requestList.filter((request) => {
        return request.name.toLowerCase().includes(this.search.toLowerCase()) ||
          request.ip_address?.includes(this.search) ||
          request.hoster_name?.toLowerCase().includes(this.search.toLowerCase()) ||
          request.country?.toLowerCase().includes(this.search.toLowerCase());
      });
      this.filterEnabled = true;
    },
  },
}
</script>

<style scoped>
/* Простые стили */
h1 {
  text-align: center;
}

form {
  display: flex;
  justify-content: left;
  gap: 10px;
  margin-bottom: 20px;
}

form.form-search {
  margin-bottom: 40px;
}

form.form-search button {
  min-width: 7rem;
}

form.form-search input {
  width: 100%;
  padding: 5px;
  font-size: 1rem;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 16px ;
  border: 1px solid #ccc;
  margin-bottom: 5px;
}

.icon-copy {
  position: absolute;
  width: 16px;
  cursor: pointer;
  margin-top: 4px;
  margin-left: 8px;
  filter: invert(70%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
}

.icon-copy.copied {
  animation: copiedAnimation 0.4s ease-in-out forwards;
}

@keyframes copiedAnimation {
  0% { transform: scale(1); }
  50% { transform: scale(1.4); }
  100% { transform: scale(1); }
}

.tag {
  background-color: #f0f0f0;
  padding: 2px 5px;
  border-radius: 5px;
  margin-right: 5px;
}
.green {
  background-color: #d1eeca;
}

button.insert {
  background-color: #b8e39f;
  color: green;
}

button.delete {
  background-color: #fff5f5;
  color: #ff7c7c;
}

button.search {
  background-color: #7c89ff;
  color: #f5f6ff;
}

</style>
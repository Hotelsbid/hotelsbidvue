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

    <form @submit.prevent="addrequest">
      <textarea aria-label="Ваш запрос на бронирование"></textarea>
      <button type="submit" class="insert">Отправить запрос</button>
    </form>

    <ul>
      <li v-for="request, index in (filterEnabled ? requestListFiltered : requestList)" :key="request.id">
        <div>
          {{ request.text }}
          <img :src="iconCopy" :class="['icon-copy', copiedIndex === index && copied ? 'copied' : '']" @click="copyToClipboard(request.ip_address, index)" />
        </div>
        <div>
          <button @click="deleterequest(request.id)" class="delete">Delete</button>
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
    async fetchrequest() {
      const { data, error } = await supabase.from('request').select('*');
      if (error) {
        console.error('Error fetching request:', error);
      } else {
        this.requestList = data;
      }
    },
    async addrequest() {
      const { name, ip_address, hoster_name, country } = this.newrequest;
      const { error } = await supabase
        .from('request')
        .insert([{ name, ip_address, hoster_name, country }]);

      if (error) {
        console.error('Error adding request:', error);
      } else {
        this.fetchrequest();
        this.newrequest = { name: '', ip_address: '', hoster_name: '', country: 'RU' };
      }
    },
    async deleterequest(id) {
      if (!confirm('Вы уверены, что хотите удалить эту заявку?')) {
        return;
      }

      const { error } = await supabase.from('request').delete().eq('id', id);
      if (error) {
        console.error('Error deleting request:', error);
      } else {
        this.requestList = this.requestList.filter((request) => request.id !== id);
      }
    },
    async logout() {
      console.log('Logging out');
      await supabase.auth.signOut();
      this.$router.push('/');
    },
    formatIp() {
      const segments = this.newrequest.ip_address
        .replace(/[^0-9.]/g, '') // Удаляет лишние символы
        .split('.')
        .map((segment) => segment.substring(0, 3)); // Ограничивает длину сегмента до 3 символов

      this.newrequest.ip_address = segments.slice(0, 4).join('.'); // Оставляет только первые 4 сегмента
    },
    // Проверяет корректность IP-адреса
    validateIp() {
      const ipRegex =
        /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;

      if (!ipRegex.test(this.newrequest.ip_address)) {
        this.error = 'Некорректный IP-адрес';
      } else {
        this.error = null;
      }
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
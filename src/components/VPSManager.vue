<template>
  <div>
    <div style="display: flex; width: 100%; margin-bottom: 40px;align-items: center;justify-content: space-between;">
      <div style="text-align: left;">
        <h1 style="margin-bottom: 0;">VPS Manager</h1>
        <span style="margin-bottom: 0;"class="tag">Пользователь: {{ user }}</span>
      </div>
      <button @click="logout">Logout</button>
    </div>
    <form @submit.prevent="addVPS">
      <input v-model="newVPS.name" placeholder="VPS Name" required />
      <input v-model="newVPS.ip_address" placeholder="IP Address 111.222.333.444" @input="formatIp" @blur="validateIp" required />
      <input v-model="newVPS.hoster_name" placeholder="Hoster name" required />
      <input v-model="newVPS.country" placeholder="Country" required />
      <button type="submit" class="insert">Add VPS</button>
    </form>

    <ul>
      <li v-for="vps in vpsList" :key="vps.id">
        <div>
          {{ vps.name }} - {{ vps.ip_address }}
          <img :src="iconCopy" class="icon-copy" @click="copyToClipboard(vps.ip_address)" />
        </div>
        <div>
          <span v-if="vps.hoster_name" class="tag">{{ vps.hoster_name }}</span>
          <span v-if="vps.country" class="tag">{{ vps.country }}</span>
          <button @click="deleteVPS(vps.id)" class="delete">Delete</button>
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
      user: '',
      vpsList: [],
      newVPS: {
        name: '',
        ip_address: '',
        hoster_name: '',
        country: 'RU',
      },
      iconCopy: iconCopy,
    };
  },
  created() {
    this.fetchVPS();
    supabase.auth.getUser().then((el) => {
      this.user = el.data.user.email;
    });
  },
  methods: {
    async fetchVPS() {
      const { data, error } = await supabase.from('vps').select('*');
      if (error) {
        console.error('Error fetching VPS:', error);
      } else {
        this.vpsList = data;
      }
    },
    async addVPS() {
      const { name, ip_address, hoster_name, country } = this.newVPS;
      const { error } = await supabase
        .from('vps')
        .insert([{ name, ip_address, hoster_name, country }]);

      if (error) {
        console.error('Error adding VPS:', error);
      } else {
        this.fetchVPS();
        this.newVPS = { name: '', ip_address: '', hoster_name: '', country: 'RU' };
      }
    },
    async deleteVPS(id) {
      if (!confirm('Вы уверены, что хотите удалить этот VPS?')) {
        return;
      }

      const { error } = await supabase.from('vps').delete().eq('id', id);
      if (error) {
        console.error('Error deleting VPS:', error);
      } else {
        this.vpsList = this.vpsList.filter((vps) => vps.id !== id);
      }
    },
    async logout() {
      console.log('Logging out');
      await supabase.auth.signOut();
      this.$router.push('/');
    },
    formatIp() {
      const segments = this.newVPS.ip_address
        .replace(/[^0-9.]/g, '') // Удаляет лишние символы
        .split('.')
        .map((segment) => segment.substring(0, 3)); // Ограничивает длину сегмента до 3 символов

      this.newVPS.ip_address = segments.slice(0, 4).join('.'); // Оставляет только первые 4 сегмента
    },
    // Проверяет корректность IP-адреса
    validateIp() {
      const ipRegex =
        /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;

      if (!ipRegex.test(this.newVPS.ip_address)) {
        this.error = 'Некорректный IP-адрес';
      } else {
        this.error = null;
      }
    },
    copyToClipboard(text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          console.log('Текст скопирован в буфер обмена:', text);
        }).catch(err => {
          console.error('Ошибка при копировании текста:', err);
        });
      } else {
        console.error('Clipboard API не поддерживается в этом браузере');
      }
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
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
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

</style>
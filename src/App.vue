<template>
  <div id="app">
    <nav class="navbar navbar-light bg-dark">
      <h1 class="navbar-brand ml-sm-2" style="margin-left: 10px; color:white; font-size:x-large">
        Kanban Board
      </h1>
      <div class="btn-toolbar" style="margin-right:10px; margin-left: 10px">
        <b-button v-if="isSaved == false" variant="primary" @click="ShowModal">
          Cadastro/Login
        </b-button>
        <b-button v-else variant="danger" @click="Leave">Sair</b-button>
      </div>
    </nav>

    <b-modal ref="modal" title="Crie ou logue na sua conta">
      <form autocomplete="off">
        <div class="form-group row mb-2">
          <label for="name-id" class="col-sm-2 col-form-label">Nome</label>
          <div class="col-sm-10">
            <input
              type="text"
              v-model="name"
              id="name-id"
              class="form-control"
              placeholder="Ex: Lucas"
              @keyup.enter="Submit"
            />
          </div>
        </div>
        <div class="form-group row">
          <label for="password-id" class="col-sm-2 col-form-label">Senha</label>
          <div class="col-sm-10">
            <input
              type="password"
              v-model="password"
              id="password-id"
              class="form-control"
              placeholder="Senha"
              @keyup.enter="Submit"
            />
          </div>
        </div>
      </form>
      <template #modal-footer>
        <b-button variant="secondary" @click="HideModal">Cancelar</b-button>
        <b-button variant="primary" @click="Submit">Cadastrar/Logar</b-button>
      </template>
    </b-modal>

    <div class="container mt-3">
      <div class="row mb-2">
        <h1 v-if="isSaved">Organize suas tarefas, {{Takename()}}</h1>
        <h1 v-else>Organize suas tarefas</h1>
      </div>
      <div class="row">
        <div class="col form-inline">
          <b-input-group>
            <b-input
              v-model="newTask"
              placeholder="Insira uma tarefa"
              @keyup.enter="AddTask"
              autocomplete="off"
            ></b-input>
            <b-button variant="success" @click="AddTask">Adicionar</b-button>
            <b-button variant="primary" @click="ChangeMode">Modo</b-button>
          </b-input-group>
        </div>
      </div>

      <div class="row mt-3">
        <div class="col-md-3">
          <div class="p-2 alert alert-secondary">
            <h5>Tarefas</h5>
            <draggable
              class="list-group kanbam-column"
              :list="tasks"
              group="allTasks"
            >
              <div
                class="list-group-item"
                v-for="(element, elementIdx) in tasks"
                :key="elementIdx"
                @click="DeleteElement(tasks, element)"
              >
                {{ element.task }}
              </div>
            </draggable>
          </div>
        </div>

        <div class="col-md-3">
          <div class="p-2 alert alert-primary">
            <h5 v-if="!mode">Para fazer</h5>
            <h5 v-else>Baixa prioridade</h5>
            <draggable
              class="list-group kanbam-column"
              :list="tasks_to_do"
              group="allTasks"
            >
              <div
                class="list-group-item"
                v-for="(element, elementIdx) in tasks_to_do"
                :key="elementIdx"
                @click="DeleteElement(tasks_to_do, element)"
              >
                {{ element.task }}
              </div>
            </draggable>
          </div>
        </div>

        <div class="col-md-3">
          <div class="p-2 alert alert-warning">
            <h5 v-if="!mode">Fazendo</h5>
            <h5 v-else>Média prioridade</h5>
            <draggable
              class="list-group kanbam-column"
              :list="tasks_doing"
              group="allTasks"
            >
              <div
                class="list-group-item"
                v-for="(element, elementIdx) in tasks_doing"
                :key="elementIdx"
                @click="DeleteElement(tasks_doing, element)"
              >
                {{ element.task }}
              </div>
            </draggable>
          </div>
        </div>

        <div class="col-md-3">
          <div class="p-2 alert alert-danger">
            <h5 v-if="!mode">Feito</h5>
            <h5 v-else>Alta prioridade</h5>
            <draggable
              class="list-group kanbam-column"
              :list="tasks_done"
              group="allTasks"
            >
              <div
                class="list-group-item"
                v-for="(element, elementIdx) in tasks_done"
                :key="elementIdx"
                @click="DeleteElement(tasks_done, element)"
              >
                {{ element.task }}
              </div>
            </draggable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";

export default {
  name: "app",
  components: {
    draggable,
  },
  data() {
    return {
      newTask: "",
      name: "",
      password: "",
      mode: false,
      touchTime: 0,
      isSaved: false,
      tasks: [],
      tasks_to_do: [],
      tasks_doing: [],
      tasks_done: [],
    };
  },
  created() {
    if (localStorage.getItem("name") && localStorage.getItem("name") != "" && localStorage.getItem("password") && localStorage.getItem("password") != "") {
      let _name = localStorage.getItem("name");
      let _password = localStorage.getItem("password");
      this.axios.get(`http://localhost:80/kanban-board/get/?name=${_name}&password=${_password}`).then((response) => {
        if (response.data == "O usuário não existe") {
          localStorage.setItem("name", "");
          localStorage.setItem("password", "");
          this.MakeToast(this.$toast.error, "Ocorreu um erro, não foi possível logar");
        } else if (response.data == "<br><br><br>") {
          this.MakeToast(this.$toast.success, "Logado com sucesso");
          this.MakeToast(this.$toast.warning, "Não há tarefas a serem carregadas");
          this.isSaved = true;
        } else {
          this.LoadTasks(response);
          this.isSaved = true;
        }
      })
    }
  },
  updated() {
    if (localStorage.getItem("name") && localStorage.getItem("name") != "" && localStorage.getItem("password") && localStorage.getItem("password") != "") {
      let _name = localStorage.getItem("name");
      let _password = localStorage.getItem("password");
      let _tasks = this.Convert(this.tasks);
      let _tasks_to_do = this.Convert(this.tasks_to_do);
      let _tasks_doing = this.Convert(this.tasks_doing);
      let _tasks_done = this.Convert(this.tasks_done);

      const UpdatePosts = () => {
        this.axios.get(`http://localhost:80/kanban-board/post/?name=${_name}&password=${_password}&tasks=${_tasks}&tasks_to_do=${_tasks_to_do}&tasks_doing=${_tasks_doing}&tasks_done=${_tasks_done}`).then(()=>{});
      }

      window.onbeforeunload = UpdatePosts;
      window.onunload = UpdatePosts;
    }
  },
  methods: {
    AddTask() {
      if (this.newTask) {
        this.tasks.push({ task: this.newTask });
        this.newTask = "";
      }
    },
    Takename() {
      return localStorage.getItem("name");
    },
    ShowModal() {
      this.$refs["modal"].show();
    },
    HideModal() {
      this.$refs["modal"].hide();
    },
    Submit() {
      this.HideModal();
      if (this.name.length === 0 || this.password.length === 0) {
        this.MakeToast(
          this.$toast.error,
          "Insira as informações corretamente"
        );
      } else {
        this.name = String(this.name);
        this.password = String(this.password);
        this.tasks = [];
        this.tasks_to_do = [];
        this.tasks_doing = [];
        this.tasks_done = [];
        this.axios
          .get(`http://localhost:80/kanban-board/get/?name=${this.name}&password=${this.password}`
          )
          .then((response) => {
            if (response.data == "O usuário não existe") {
              this.axios.get(`http://localhost:80/kanban-board/post/?name=${this.name}&password=${this.password}`).then(() => {
                this.MakeToast(this.$toast.success, "Conta criada com sucesso");  
              })
            } else if (response.data == "<br><br><br>") {
              this.MakeToast(this.$toast.success, "Logado com sucesso");
              this.MakeToast(this.$toast.warning, "Não há tarefas a serem carregadas");
            } else {
              this.LoadTasks(response);
            }
          localStorage.setItem("name", this.name);
          localStorage.setItem("password", this.password);
          this.isSaved = true;
        });
      }
    },

    Leave() {
      let _name = localStorage.getItem("name");
      let _password = localStorage.getItem("password");
      let _tasks = this.Convert(this.tasks);
      let _tasks_to_do = this.Convert(this.tasks_to_do);
      let _tasks_doing = this.Convert(this.tasks_doing);
      let _tasks_done = this.Convert(this.tasks_done);

      this.axios.get(`http://localhost:80/kanban-board/post/?name=${_name}&password=${_password}&tasks=${_tasks}&tasks_to_do=${_tasks_to_do}&tasks_doing=${_tasks_doing}&tasks_done=${_tasks_done}`).then(() => {
        localStorage.setItem("name", "");
        localStorage.setItem("password", "");
        this.mode = false;
        this.name = "";
        this.password = "";
        this.tasks = [];
        this.tasks_to_do = [];
        this.tasks_doing = [];
        this.tasks_done = [];
        this.isSaved = false;
      })
    },

    LoadTasks(response) {
      let array = response.data.split("<br>");
      let lists = [this.tasks, this.tasks_to_do, this.tasks_doing, this.tasks_done];

      let iterators = lists.map((e, i) => {
        return [e, array[i]];
      })

      for (const dataIndex in iterators) {
        if (iterators[dataIndex][1] == "") {
          continue;
        } else {
          let objsArray = iterators[dataIndex][1].split(",");
          for (const objIndex in objsArray) {
            iterators[dataIndex][0].push(JSON.parse(objsArray[objIndex]));
          }
        }
      }

      this.MakeToast(this.$toast.success, "Logado com sucesso");
    },

    DeleteElement(list, object) {
      if (this.touchTime == 0) {
        this.touchTime = new Date().getTime();
      } else {
        if (new Date().getTime() - this.touchTime < 800) {
          let index = list.indexOf(object);
          list.splice(index, 1);
          this.touchTime = 0;
        } else {
          this.touchTime = new Date().getTime();
        }
      }
    },

    ChangeMode() {
      if (this.mode) {
        this.mode = false;
      } else {
        this.mode = true;
      }
    },

    Convert(list) {
      let _list = JSON.stringify(list);
      _list = _list.slice(0, -1);
      _list = _list.slice(1, _list.length);
      return _list;
    },

    MakeToast(type, text) {
      type(text, {
        position: "bottom-right",
        timeout: 5000,
        closeOnClick: true,
        pauseOnFocusLoss: false,
        pauseOnHover: true,
        draggable: true,
        draggablePercent: 0.6,
        showCloseButtonOnHover: false,
        closeButton: "button",
        icon: true,
        rtl: false,
      });
    },
  },
};
</script>

<style scoped>
.kanbam-column {
  min-height: 100px;
  max-height: 300px;
  overflow: auto;
}
.list-group-item {
  cursor: pointer;
  word-break: break-word;
}
::-webkit-scrollbar-track {
  background-color: #f4f4f4;
}
::-webkit-scrollbar {
  width: 6px;
  background: #f4f4f4;
}
::-webkit-scrollbar-thumb {
  background: #dad7d7;
}
</style>
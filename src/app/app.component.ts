import { loadRemoteModule } from '@angular-architects/module-federation';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './services/user.service';
export interface User {
  id: number;
  name: string;
  salary: number;
  companyValuation: number;
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  URLremoteEntry = 'http://localhost:4202/remoteEntry.js';
  HeaderComponent: any;
  CardComponent: any;
  ButtonLongComponent: any;
  ModalnewclienteComponent: any;
  ModaldeleteclienteComponent: any;
  ModaleditComponent: any;
  clientToDelete: User | null = null;
  modalInjector!: Injector;
  modalClosed = new EventEmitter<void>();
  MenuComponent: any;
  cardData: any = {};
  cardInjector: Injector = Injector.create({ providers: [] });
  isModalOpenAdd = false;
  isModalOpendelete = false;
  isModalOpenEdit = false;
  isOpenMenu = false;
  user = {
    name: 'John Doe',
    salary: 5000,
    companyValuation: 500000,
  };

  clientData = {
    id: '',
    name: '',
    salary: '',
    companyValuation: '',
  };
  constructor(private clientService: UserService, private injector: Injector) {}

  async ngOnInit() {
    this.modalClosed.subscribe(() => {
      this.closeModal();
    });
    this.clientData = {
      id: '',
      name: '',
      salary: '',
      companyValuation: '',
    };
    try {
      const data = await this.clientService.getUsers().toPromise();

      this.cardData = {
        clients: data.users,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        id: data.id,
      };

      // Criando o Injector para passar os dados ao CardComponent
      this.cardInjector = Injector.create({
        providers: [{ provide: 'cardData', useValue: this.cardData }],
      });

      //uso dos componentes
      this.HeaderComponent = await loadRemoteModule({
        type: 'module',
        remoteEntry: this.URLremoteEntry,
        exposedModule: './Header',
      }).then((m) => m.HeaderComponent);

      this.ButtonLongComponent = await loadRemoteModule({
        type: 'module',
        remoteEntry: this.URLremoteEntry,
        exposedModule: './ButtonLong',
      }).then((m) => {
        console.log('button carregado!', m);
        return m.ButtonLongComponent;
      });

      this.ModalnewclienteComponent = await loadRemoteModule({
        type: 'module',
        remoteEntry: this.URLremoteEntry,
        exposedModule: './ModalAdd',
      }).then((m) => {
        console.log('Card carregado!', m);
        return m.ModalnewclienteComponent;
      });
      this.cardData = data;
      this.cardInjector = Injector.create({
        providers: [{ provide: 'cardData', useValue: this.cardData }],
      });

      this.ModalnewclienteComponent = await loadRemoteModule({
        type: 'module',
        remoteEntry: this.URLremoteEntry,
        exposedModule: './ModalAdd',
      }).then((m) => {
        return m.ModalnewclienteComponent;
      });

      this.ModaldeleteclienteComponent = await loadRemoteModule({
        type: 'module',
        remoteEntry: this.URLremoteEntry,
        exposedModule: './ModalDelete',
      }).then((m) => {
        return m.ModaldeleteclienteComponent;
      });
      this.ModaleditComponent = await loadRemoteModule({
        type: 'module',
        remoteEntry: this.URLremoteEntry,
        exposedModule: './ModalEdit',
      }).then((m) => {
        return m.ModaleditComponent;
      });
      this.MenuComponent = await loadRemoteModule({
        type: 'module',
        remoteEntry: this.URLremoteEntry,
        exposedModule: './Menu',
      }).then((m) => {
        return m.MenuComponent;
      });
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  }

  createClient(client: any) {
    console.log('Dados enviados:', client);
    this.clientService.newClient(client).subscribe(
      (response) => {
        console.log('Client added successfully:', response);
        alert('Cliente criado com sucesso');
        this.closeModal();
      },
      (error) => {
        console.error('Error adding client:', error);
      }
    );
  }

  updateUser(client: any): void {
    this.clientService.updateUser(client).subscribe(
      (response) => {
        console.log('Resposta do servidor:', response);
        alert('Cliente Editado com sucesso');
        this.closeModalEdit();
      },
      (error) => {
        console.error('Erro:', error);
      }
    );
  }

  deleteClient(id: number) {
    console.log('Removendo cliente com ID:', id);

    // Remover o cliente via API
    this.clientService.deleteUser(id).subscribe(
      (response) => {
        if (typeof response === 'string') {
          console.log('Resposta da API:', response);
        } else {
          this.cardData.clients = this.cardData.clients.filter(
            (client: User) => client.id !== id
          );
          this.cardData.totalPages = Math.ceil(
            this.cardData.clients.length / 10
          );
          if (this.cardData.currentPage > this.cardData.totalPages) {
            this.cardData.currentPage = this.cardData.totalPages;
          }
        }
        this.closeModalDelete();
      },
      (error) => {
        console.error('Erro ao remover cliente:', error);
      }
    );
  }

  onOpenModalCreateClient() {
    console.log('Abrindo modal...');
    this.isModalOpenAdd = true;

    this.modalInjector = Injector.create({
      providers: [
        { provide: 'clientData', useValue: this.clientData },
        {
          provide: 'closeModalEvent',
          useValue: () => this.closeModal(),
        },
        {
          provide: 'submitClientEvent',
          useValue: (client: any) => this.createClient(client),
        },
      ],
      parent: this.injector,
    });
  }

  onOpenModalAdd() {
    console.log('Abrindo modal...');
    this.isModalOpenAdd = true;

    this.modalInjector = Injector.create({
      providers: [
        { provide: 'clientData', useValue: this.clientData },
        {
          provide: 'closeModalEvent',
          useValue: () => this.closeModal(),
        },
        {
          provide: 'submitClientEvent',
          useValue: (client: any) => this.createClient(client),
        },
      ],
      parent: this.injector,
    });
  }

  onOpenModalEdit(id: number) {
    console.log('Abrindo modal...');
    this.isModalOpenEdit = true;

    this.modalInjector = Injector.create({
      providers: [
        { provide: 'clientData', useValue: id },
        {
          provide: 'closeModalEvent',
          useValue: () => this.closeModalEdit(),
        },
        {
          provide: 'submitClientEvent',
          useValue: (client: any) => this.updateUser(client),
        },
      ],
      parent: this.injector,
    });
  }

  onOpenModalDelete(id: number) {
    console.log('Abrindo modal...');
    this.isModalOpendelete = true;

    this.modalInjector = Injector.create({
      providers: [
        { provide: 'clientData', useValue: id },
        {
          provide: 'closeModalEvent',
          useValue: () => this.closeModalDelete(),
        },
        {
          provide: 'submitClientEvent',
          useValue: (client: any) => this.deleteClient(id),
        },
      ],
      parent: this.injector,
    });
  }

  onOpenMenu() {
    console.log('Abrindo modal...');
    this.isOpenMenu = true;

    this.modalInjector = Injector.create({
      providers: [
        {
          provide: 'closeModalEvent',
          useValue: () => this.closeMenu(),
        },
      ],
      parent: this.injector,
    });
  }

  closeModal() {
    this.isModalOpenAdd = false;
  }
  closeModalEdit() {
    this.isModalOpenEdit = false;
  }
  closeModalDelete() {
    this.isModalOpendelete = false;
  }
  closeMenu() {
    this.isOpenMenu = false;
  }
}

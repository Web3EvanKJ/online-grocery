// import { Router } from 'express';

// import { ExampleController } from '../controllers/example.controller';

// /**
//  * @class ExampleRouter
//  * @description
//  * Kelas ini bertanggung jawab untuk mendefinisikan semua route yang
//  * berhubungan dengan fitur autentikasi.
//  * Tujuannya adalah untuk mengelompokkan endpoint agar struktur proyek lebih rapi.
//  */
// class ExampleRouter {
//   public router: Router;
//   private exampleController: ExampleController;

//   constructor() {
//     this.router = Router();
//     this.exampleController = new ExampleController();
//     this.initializeRoutes();
//   }

//   /**
//    * @class ExampleRouter
//    * @description
//    * Kelas ini bertanggung jawab untuk mendefinisikan semua route yang
//    * berhubungan dengan fitur autentikasi.
//    * Tujuannya adalah untuk mengelompokkan endpoint agar struktur proyek lebih rapi.
//    */
//   private initializeRoutes() {
//     // GET /register akan ditangani oleh method `register` dari exampleController.
//     // Kita bisa langsung memanggilnya karena method di controller sudah menggunakan arrow function.
//     // eslint-disable-next-line @typescript-eslint/unbound-method
//     this.router.get('/register', this.exampleController.register);

//     // GET /login akan ditangani oleh method `login` dari exampleController.
//     this.router.get('/login', this.exampleController.login);
//   }
// }

// export default new ExampleRouter().router;

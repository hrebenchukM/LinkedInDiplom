// import { useContext, useEffect, useState } from "react";
// import AppContext from "../../features/appContext/AppContext";


// export default function Admin() {
//     const {user, request} = useContext(AppContext);
//     const [groups, setGroups] = useState([]);

//     const loadGroups = () => {
//         request("api://admin/groups").then(setGroups);
//     };

//     useEffect(() => {
//         if(user) {
//             loadGroups();
//         }
//         else {
//             setGroups([]);
//         }
//     }, [user]);

//     const onProductFormSubmit = e => {
//         e.preventDefault();
//         request("api://admin/product", {
//             method: "POST",
//             body: new FormData(e.target)
//         }).then(_ => alert("Товар додано"));
//     }

//     const onGroupFormSubmit = e => {
//         e.preventDefault();
//         request("api://admin/group", {
//             method: "POST",
//             body: new FormData(e.target)
//         }).then(_ => {
//             e.target.reset();
//             loadGroups();
//             alert("Групу додано");
//         });
//     };

//     return !user 
//     ? <>    
//         <div className="alert alert-danger mt-4" role="alert">
//             Необхідно автентифікуватися
//         </div>
//     </>
//     : <>
//         <div className="border m-3 p-2">
//             <h2>Додати товарну групу</h2>
//             <form onSubmit={onGroupFormSubmit} method="POST" encType="multipart/form-data">
//                 <div className="row">
//                     <div className="col">
//                         <div className="input-group mb-3">
//                             <span className="input-group-text" id="pg-name-addon">Назва</span>
//                             <input type="text" className="form-control" 
//                                 name="pg-name"
//                                 placeholder="Назва групи" 
//                                 aria-label="Назва групи" 
//                                 aria-describedby="pg-name-addon"/>
//                         </div>
//                     </div>
//                     <div className="col">
//                         <div className="input-group mb-3">
//                             <span className="input-group-text" id="pg-description-addon">Опис</span>
//                             <input type="text" className="form-control" 
//                                 name="pg-description"
//                                 placeholder="Опис групи" 
//                                 aria-label="Опис групи" 
//                                 aria-describedby="pg-description-addon"/>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="row">
//                     <div className="col">
//                         <div className="input-group mb-3">
//                             <span className="input-group-text" id="pg-slug-addon">Slug</span>
//                             <input type="text" className="form-control" 
//                                 name="pg-slug"
//                                 placeholder="Посилання на групу" 
//                                 aria-label="Посилання на групу" 
//                                 aria-describedby="pg-slug-addon"/>
//                         </div>
//                     </div>
//                     <div className="col">
//                         <div className="input-group mb-3">
//                             <label className="input-group-text" htmlFor="pg-image">Зображення</label>
//                             <input type="file" className="form-control" id="pg-image" name="pg-image"/>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="row">
//                     <div className="col">
//                         <div className="input-group mb-3">
//                             <label className="input-group-text" htmlFor="inputGroupSelect01">Підлеглість</label>
//                             <select name="pg-parent-id" className="form-select" id="inputGroupSelect01">
//                                 <option value="">Без підлеглості</option>
//                                 {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
//                             </select>
//                         </div>
//                     </div>
//                     <div className="col">
//                         <button type="submit" className="btn btn-primary">Додати</button>
//                     </div>
//                 </div>
//             </form>
//         </div>

//         <div className="border m-3 p-2">
//             <h2>Додати товар</h2>
//             <form onSubmit={onProductFormSubmit} method="POST" encType="multipart/form-data">
//                 <div className="row">
//                     <div className="col">
//                         <div className="input-group mb-3">
//                             <span className="input-group-text" id="product-name-addon">Назва</span>
//                             <input type="text" className="form-control" 
//                                 name="product-name"
//                                 placeholder="Назва" 
//                                 aria-label="Назва" 
//                                 aria-describedby="product-name-addon"/>
//                         </div>
//                     </div>
//                     <div className="col">
//                         <div className="input-group mb-3">
//                             <span className="input-group-text" id="product-description-addon">Опис</span>
//                             <input type="text" className="form-control" 
//                                 name="product-description"
//                                 placeholder="Опис" 
//                                 aria-label="Опис" 
//                                 aria-describedby="product-description-addon"/>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="row">
//                     <div className="col">
//                         <div className="input-group mb-3">
//                             <span className="input-group-text" id="product-price-addon">Ціна</span>
//                             <input type="number" min="0" step="0.01" className="form-control" 
//                                 name="product-price"
//                                 placeholder="Ціна" 
//                                 aria-label="Ціна" 
//                                 aria-describedby="product-price-addon"/>
//                         </div>
//                     </div>
//                     <div className="col">
//                         <div className="input-group mb-3">
//                             <span className="input-group-text" id="product-stock-addon">Кількість</span>
//                             <input type="number" min="0" step="1" className="form-control" 
//                                 name="product-stock"
//                                 placeholder="Кількість" 
//                                 aria-label="Кількість" 
//                                 aria-describedby="product-stock-addon"/>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="row">
//                     <div className="col">
//                         <div className="input-group mb-3">
//                             <span className="input-group-text" id="product-slug-addon">Slug</span>
//                             <input type="text" className="form-control" 
//                                 name="product-slug"
//                                 placeholder="Посилання на сторінку товару" 
//                                 aria-label="Посилання на сторінку товару" 
//                                 aria-describedby="product-slug-addon"/>
//                         </div>
//                     </div>
//                     <div className="col">
//                         <div className="input-group mb-3">
//                             <label className="input-group-text" htmlFor="product-image">Зображення</label>
//                             <input type="file" className="form-control" id="product-image" name="product-image"/>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="row">
//                     <div className="col">
//                         <div className="input-group mb-3">
//                             <label className="input-group-text" htmlFor="inputGroupSelect02">Група:</label>
//                             <select name="product-group-id" className="form-select" id="inputGroupSelect02">
//                                 {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
//                             </select>
//                         </div>
//                     </div>
//                     <div className="col">
//                         <button type="submit" className="btn btn-primary">Додати</button>
//                     </div>
//                 </div>
//             </form>
//         </div>
//     </>;
// }
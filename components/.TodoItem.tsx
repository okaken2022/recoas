// import { useState, useEffect, forwardRef } from "react";
// // import DatePicker from "react-datepicker";
// // import "react-datepicker/dist/react-datepicker.css";

// // import { useRecoilState } from "recoil";
// // import {
// //   todoListState,
// //   todoIsEditable,
// //   todoEditId,
// //   todoEditTitle,
// // } from "../components/atom";
// import {
//   Button,
//   ButtonGroup,
//   Card,
//   CardBody,
//   Flex,
//   Box,
//   Text,
//   Select,
//   HStack,
//   Tag,
// } from "@chakra-ui/react";
// import { EditIcon, DeleteIcon } from "@chakra-ui/icons";

// export type Item = {
//   id: number;
//   title: string;
//   status: string;
//   password: string;
// };

// export const TodoItem: React.FC<{ item: Item }> = ({ item }) => {
//   const [todoList, setTodoList] = useState('');

//   // 削除
//   // idを引数に取ればもっと短くかけると思います！
//   const deleteItem = () => {
//     const index = todoList.findIndex((listItem) => listItem.id === item.id);
//     const newTodoList = [
//       ...todoList.slice(0, index),
//       ...todoList.slice(index + 1),
//     ];
//     setTodoList(newTodoList);
//   };

//   // //期限
//   // const [startDate, setStartDate] = useState(new Date());
//   // const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
//   //   <Button onClick={onClick} ref={ref} size="xs" bg="white">
//   //     {value}
//   //   </Button>
//   // ));
//   // const handleDateChange = (date) => {
//   //   setStartDate(date);
//   //   const newArray = todoList.map((todo) =>
//   //     todo.id === item.id ? { ...item, date: date } : todo
//   //   );
//   //   setTodoList(newArray);
//   //   console.log(todoList);
//   // };

//   // 編集
//   const [isEditable, setIsEditable] = useState(false);
//   // 編集対象のtodoId
//   const [editId, setEditId] = useState(0);
//   // 編集対象のtodoTitle
//   const [title, setTitle] = useState();
//   const openEditTodo = (id: number) => {
//     setIsEditable(true);
//     // 編集ボタンを押したtodo itemのidをsetEditIdに入れる
//     setEditId(id);
//     // 編集ボタンを押したtodo itemのtitleをグローバルstateのtodoEditTitleに入れる
//     setTitle(todoList[id - 1].title);
//   };

//   // 進捗
//   // const handleStatusChange = (item, e) => {
//   //   const newArray = todoList.map((todo) =>
//   //     todo.id === item.id ? { ...item, status: e.target.value } : todo
//   //   );
//   //   setTodoList(newArray);
//   // };

//   return (
//     <>
//       <Card>
//         <CardBody bg="#f1f1f1" p={{ base: "2", md: "4" }}>
//           {/* タイトル */}
//           <Flex
//             minWidth="max-content"
//             alignItems={{ md: "center" }}
//             gap="2"
//             direction={{ base: "column", md: "row" }}
//           >
//             {/* Todoタイトル */}
//             <Box flex="1" p="2">
//               <Flex minWidth="max-content" alignItems="center" gap="2">
//                 <Box>
//                   <Text as="b" fontSize="xl">
//                     {item.id}.
//                   </Text>
//                 </Box>
//                 <Text fontSize="xl">{item.title}</Text>
//               </Flex>
//             </Box>

//             {/* 期限 */}
//             <HStack>
//               {/* <Box p="2">
//                 <Tag bg="#4A6DA7" color="white">
//                   期限
//                 </Tag>
//                 <DatePicker
//                   selected={startDate}
//                   onChange={(date) => handleDateChange(date)}
//                   customInput={<ExampleCustomInput />}
//                 />
//               </Box> */}

//               {/* 状態 */}
//               <Box p="2">
//                 <Tag bg="#4A6DA7" color="white">
//                   進捗
//                 </Tag>
//                 <Select
//                   value={item.status}
//                   size="xs"
//                   bg="white"
//                   onChange={(e) => handleStatusChange(item, e)}
//                 >
//                   <option value="option1">未完了</option>
//                   <option value="option2">着手</option>
//                   <option value="option3">完了</option>
//                 </Select>
//               </Box>
//             </HStack>
//             {/* ボタン類 */}
//             <ButtonGroup gap="2">
//               <Button onClick={() => openEditTodo(item.id)} colorScheme="teal">
//                 <EditIcon />
//               </Button>
//               <Button onClick={deleteItem} colorScheme="red">
//                 <DeleteIcon />
//               </Button>
//             </ButtonGroup>
//           </Flex>
//         </CardBody>
//       </Card>
//     </>
//   );
// }

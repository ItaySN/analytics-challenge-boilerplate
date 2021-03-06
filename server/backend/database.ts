import path from "path";
import bcrypt from "bcryptjs";
import fs from "fs";
import { v4 } from "uuid";
import {
  uniqBy,
  sortedUniqBy,
  map,
  sample,
  reject,
  includes,
  orderBy,
  flow,
  flatMap,
  curry,
  get,
  constant,
  filter,
  inRange,
  remove,
  countBy,
  groupBy,
} from "lodash/fp";
import { endOfDay, isWithinInterval, startOfDay } from "date-fns";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import shortid from "shortid";
import {
  BankAccount,
  Transaction,
  User,
  Contact,
  TransactionStatus,
  TransactionRequestStatus,
  Like,
  Comment,
  PaymentNotification,
  PaymentNotificationStatus,
  LikeNotification,
  CommentNotification,
  NotificationType,
  NotificationPayloadType,
  NotificationsType,
  TransactionResponseItem,
  TransactionPayload,
  BankTransfer,
  BankTransferPayload,
  BankTransferType,
  NotificationResponseItem,
  TransactionQueryPayload,
  DefaultPrivacyLevel,
  Event
} from "../../client/src/models";
import Fuse from "fuse.js";
import {
  isPayment,
  getTransferAmount,
  hasSufficientFunds,
  getChargeAmount,
  hasDateQueryFields,
  getDateQueryFields,
  hasAmountQueryFields,
  getAmountQueryFields,
  getQueryWithoutFilterFields,
  getPayAppCreditedAmount,
  isRequestTransaction,
  formatFullName,
  isLikeNotification,
  isCommentNotification,
} from "../../client/src/utils/transactionUtils";
import { DbSchema } from "../../client/src/models/db-schema";
import { last, sum } from "lodash";


export type TDatabase = {
  users: User[];
  contacts: Contact[];
  bankaccounts: BankAccount[];
  transactions: Transaction[];
  likes: Like[];
  comments: Comment[];
  notifications: NotificationType[];
  banktransfers: BankTransfer[];
  events: Event[];
};

const USER_TABLE = "users";
const CONTACT_TABLE = "contacts";
const BANK_ACCOUNT_TABLE = "bankaccounts";
const TRANSACTION_TABLE = "transactions";
const LIKE_TABLE = "likes";
const COMMENT_TABLE = "comments";
const NOTIFICATION_TABLE = "notifications";
const BANK_TRANSFER_TABLE = "banktransfers";
const EVENT_TABLE = "events";

const databaseFile = path.join(__dirname, "../data/database.json");
const adapter = new FileSync<DbSchema>(databaseFile);

const db = low(adapter);

export const seedDatabase = () => {
  const testSeed = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data", "database-seed.json"), "utf-8")
  );

  // seed database with test data
  db.setState(testSeed).write();
  return;
};

export const getAllUsers = () => db.get(USER_TABLE).value();

export const getAllPublicTransactions = () =>
  db.get(TRANSACTION_TABLE).filter({ privacyLevel: DefaultPrivacyLevel.public }).value();

export const getAllForEntity = (entity: keyof DbSchema) => db.get(entity).value();

export const getAllBy = (entity: keyof DbSchema, key: string, value: any) => {
  const result = db
    .get(entity)
    // @ts-ignore
    .filter({ [`${key}`]: value })
    .value();

  return result;
};

export const getBy = (entity: keyof DbSchema, key: string, value: any) => {
  const result = db
    .get(entity)
    // @ts-ignore
    .find({ [`${key}`]: value })
    .value();

  return result;
};

export const getAllByObj = (entity: keyof DbSchema, query: object) => {
  const result = db
    .get(entity)
    // @ts-ignore
    .filter(query)
    .value();

  return result;
};

// Search
export const cleanSearchQuery = (query: string) => query.replace(/[^a-zA-Z0-9]/g, "");

export const setupSearch = curry((items: object[], options: {}, query: string) => {
  const fuse = new Fuse(items, options);
  return fuse.search(query);
});

export const performSearch = (items: object[], options: {}, query: string) =>
  flow(
    cleanSearchQuery,
    setupSearch(items, options),
    map((result) => result.item)
  )(query);

export const searchUsers = (query: string) => {
  const items = getAllUsers();
  return performSearch(
    items,
    {
      keys: ["firstName", "lastName", "username", "email", "phoneNumber"],
    },
    query
  ) as User[];
};

export const removeUserFromResults = (userId: User["id"], results: User[]) =>
  remove({ id: userId }, results);


interface Filter {
  sorting: string; // '+date'/'-date'
  type: string;
  browser: string;
  search: string;
  offset: number;
}  
// convenience methods

//Event
export const getAllEvents = ():Event[] => db.get(EVENT_TABLE).value(); 
export const getEventsBy = (key: string, value: any):Event[] => getAllBy(EVENT_TABLE,key,value);
export const saveEvent = (event: Event) => {
  db.get(EVENT_TABLE).push(event).write();
};

import {OneDay, OneHour, OneWeek} from './timeFrames'
import { any, fromCallback } from "bluebird";
import { Console, count } from "console";
import { stringify } from "querystring";
import { start } from "repl";
import { ConfigSet } from "ts-jest/dist/config/config-set";
import { eventNames } from "process";
import { el } from "date-fns/locale";

export const getDateInFullFormat = (dateNow: number): string =>{
  let year = new Date(dateNow).getFullYear()
  let day = new Date(dateNow).getDate()
  let month = new Date(dateNow).getMonth() + 1;
  let hours = new Date(dateNow).getHours()
  let minutes = new Date(dateNow).getMinutes()
  return `${year}/${month}/${day}/${hours}/${minutes}`;
}

export const formatDate = (date:Date):string =>{
  var displayDate = ("0" + date.getDate()).slice(-2) + "/" +
    ("0" + (date.getMonth() + 1)).slice(-2) + "/" +
    ( + date.getFullYear())
  return displayDate;
}

export const formatHour = (date: Date): string => {
  var displayDate = ("0" + date.getHours()).slice(-2) + ":" +
    ("0" + "0");
  return displayDate;
}

export const convertDaysToMili = (days: number) => days * 24 * 60 * 60 * 1000;

interface dayCountObj {
  date: string,
  count: number
}

export const datesOfAweek = (firstdate:number):dayCountObj[] =>{ 
  let datesObj:{date:string, count:number}[] = [];
  for(let i = 0; i < 7; i++)
  {
    
    let dispalyDate:string = formatDate(new Date(firstdate + OneDay * i))
    datesObj.push({date:dispalyDate,count:0})
  }
  return datesObj;
}

interface hourCountObj {
  hour:string,
  count:number
}

export const hoursOfADay = (startOfTheDay:number):hourCountObj[] =>{
  let hoursObj:{hour:string, count:number}[] = [];
  for(let i = 0; i < 24; i++){
    let displayHour:string = formatHour(new Date(startOfTheDay + OneHour * i))
    hoursObj.push({hour:displayHour , count:0})
  }
  return hoursObj;
}

export const sessionsByDay = (offset:number):dayCountObj[] => {
  let lastDate:number = new Date(new Date().toDateString()).getTime() + convertDaysToMili(1 - offset);
  let firstDate: number = new Date(new Date().toDateString()).getTime() - convertDaysToMili(offset + 6); 
  let datesArr  = datesOfAweek(firstDate)
  let events = db.get(EVENT_TABLE)
  .filter((event:Event) => (event.date < lastDate) && (event.date > firstDate))
  .sort((a:Event,b:Event) => a.date - b.date ) 
  .groupBy((event:Event) => formatDate(new Date(event.date))).value()
  let eventsByDay:{}[];
  eventsByDay = Object.keys(events).map((key) => {
  let uniqEvent:Event[] = uniqBy("session_id",events[key])
    return {date: key , count : uniqEvent.length}
  })
  eventsByDay.map((date: any) => {
    let index:number = datesArr.findIndex((date2:dayCountObj) => date.date === date2.date)
    if(index > -1)
      datesArr[index] = date
  })
  

  return datesArr;
}

export const sessionByHour = (offset:number):hourCountObj[] =>{
  let endOfTheDay:number = new Date(new Date().toDateString()).getTime() + convertDaysToMili(1-offset);
  let startOfTheDay:number = new Date(new Date().toDateString()).getTime() - convertDaysToMili(offset);
  let hoursArr = hoursOfADay(startOfTheDay);
  let events = db.get(EVENT_TABLE)
  .filter((event:Event) => (event.date < endOfTheDay) && (event.date > startOfTheDay))
  .sort((a:Event, b:Event) => a.date - b.date)
  .groupBy((event:Event) => formatHour(new Date(event.date))).value()
  let eventsByHour = Object.keys(events).map((key) => {
    let uniqEvent:Event[] = uniqBy("session_id", events[key])
    return {hour:key , count: uniqEvent.length}
  })
  eventsByHour.map((date: hourCountObj) => {
    let index: number = hoursArr.findIndex((date2: hourCountObj) => date.hour === date2.hour)
    if (index > -1)
      hoursArr[index] = date
  })
  return hoursArr;
}

export const signUpUsersOfOneWeek = (dayZero:number):string[] => {
  let start:number = new Date(new Date(dayZero + 2 * OneHour).toDateString()).getTime()
  let endOfTheWeek:number = start + OneWeek;
  let endDate:number = new Date(new Date(endOfTheWeek).toDateString()).getTime()
  endOfTheWeek = endDate
  let events:Event[] = db.get(EVENT_TABLE)
  .filter((event:Event) => (event.date > start) && (event.date < endOfTheWeek))
  .filter((event:Event) => (event.name === 'signup')).value()
  let newUsers:string[] = [] 
  events.map((event:Event) => newUsers.push(event.distinct_user_id))
  return newUsers;
}

export const howManyLogInPercent = (dayZero:number,signUpUsers:string[]):number => {
  let count:number = 0;
  let checkArr = Array(signUpUsers.length).fill(0);
  let endOfTheWeek:number = dayZero + OneWeek + 2 * OneHour
  endOfTheWeek = new Date(endOfTheWeek).getTime()
  let events:Event[] = db.get(EVENT_TABLE)
  .filter((event:Event) => (event.date < endOfTheWeek)&&(event.date > dayZero))
  .filter((event:Event) => event.name === 'login').value()
  for(let i = 0; i < signUpUsers.length; i++)
  {
    for(let j = 0; j < events.length; j++)
    {
      if((signUpUsers[i] === events[j].distinct_user_id) && (checkArr[i] === 0))
      {
          count += 1
          checkArr[i] = 1;
      }
    }
  }
  return Math.round((count * 100) / (signUpUsers.length))
}

export const retentionFunc = (dayZero: number, lastDay: number): {}[] => {
  let retentionArr: {}[] = [];
  let i = 0;
  let firstDate: number;
  let percentWeeks:number[] = [];
  let tempDayZero = dayZero;
  do {
    firstDate = new Date(new Date((dayZero)).toDateString()).getTime();
    let signUpsArr:string[] = signUpUsersOfOneWeek(dayZero);
    while(tempDayZero<=lastDay)
    {
      if(percentWeeks.length !== 0)
      {
        percentWeeks.push(howManyLogInPercent(tempDayZero,signUpsArr))
      }
      else{
        percentWeeks.push(100)
      }
      tempDayZero = tempDayZero + OneWeek
    }
    let firstDateDisplay: string = formatDate(new Date(dayZero));
    dayZero = dayZero + OneWeek;
    tempDayZero = dayZero;
    retentionArr[i] = { registrationWeek: i, newUsers: signUpsArr.length, weeklyRetention: percentWeeks, firstDate: firstDateDisplay, lastDate: formatDate(new Date(dayZero - OneDay + 2 * OneHour))}
    percentWeeks = []
    i += 1
  } while (dayZero <= lastDay)
  return retentionArr;
}

interface weeklyRetentionObject {
  registrationWeek: number;  //launch is week 0 and so on
  newUsers: number;  // how many new user have joined this week
  weeklyRetention: number[]; // for every week since, what percentage of the users came back. weeklyRetention[0] is always 100% because it's the week of registration  
  firstDate: string;  //date string for the first day of the week
  lastDate: string  //date string for the first day of the week
}
export const retention = (dayZero: number):weeklyRetentionObject[] =>{
  let start: Date = new Date(new Date(dayZero).setHours(6, 0, 0))
  start = new Date(start.setHours(0,0,0))
  let dayZeroMill:number = start.getTime()
  let end: Date = new Date(new Date().setHours(6, 0, 0))
  end = new Date(end.setHours(23, 59, 59)) 
  let endDate:number = end.getTime();
  let registrationWeeks:any[] = retentionFunc(dayZeroMill,endDate)
  return registrationWeeks
}



// User
export const getUserBy = (key: string, value: any) => getBy(USER_TABLE, key, value);
export const getUserId = (user: User): string => user.id;
export const getUserById = (id: string) => getUserBy("id", id);
export const getUserByUsername = (username: string) => getUserBy("username", username);

export const createUser = (userDetails: Partial<User>): User => {
  const password = bcrypt.hashSync(userDetails.password!, 10);
  const user: User = {
    id: shortid(),
    uuid: v4(),
    firstName: userDetails.firstName!,
    lastName: userDetails.lastName!,
    username: userDetails.username!,
    password,
    email: userDetails.email!,
    phoneNumber: userDetails.phoneNumber!,
    balance: userDetails.balance! || 0,
    avatar: userDetails.avatar!,
    defaultPrivacyLevel: userDetails.defaultPrivacyLevel!,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  saveUser(user);
  return user;
};

const saveUser = (user: User) => {
  db.get(USER_TABLE).push(user).write();
};

export const updateUserById = (userId: string, edits: Partial<User>) => {
  const user = getUserById(userId);

  db.get(USER_TABLE).find(user).assign(edits).write();
};

// Contact
export const getContactBy = (key: string, value: any) => getBy(CONTACT_TABLE, key, value);

export const getContactsBy = (key: string, value: any) => getAllBy(CONTACT_TABLE, key, value);

export const getContactsByUsername = (username: string) =>
  flow(getUserByUsername, getUserId, getContactsByUserId)(username);

export const getContactsByUserId = (userId: string): Contact[] => getContactsBy("userId", userId);

export const createContact = (contact: Contact) => {
  db.get(CONTACT_TABLE).push(contact).write();

  // manual lookup after create
  return getContactBy("id", contact.id);
};

export const removeContactById = (contactId: string) => {
  const contact = getContactBy("id", contactId);

  db.get(CONTACT_TABLE).remove(contact).write();
};

export const createContactForUser = (userId: string, contactUserId: string) => {
  const contactId = shortid();
  const contact: Contact = {
    id: contactId,
    uuid: v4(),
    userId,
    contactUserId,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  // Write contact record to the database
  const result = createContact(contact);

  return result;
};

// Bank Account
export const getBankAccountBy = (key: string, value: any) => getBy(BANK_ACCOUNT_TABLE, key, value);

export const getBankAccountById = (id: string) => getBankAccountBy("id", id);

export const getBankAccountsBy = (key: string, value: any) =>
  getAllBy(BANK_ACCOUNT_TABLE, key, value);

export const createBankAccount = (bankaccount: BankAccount) => {
  db.get(BANK_ACCOUNT_TABLE).push(bankaccount).write();

  // manual lookup after create
  return getBankAccountBy("id", bankaccount.id);
};

export const createBankAccountForUser = (userId: string, accountDetails: Partial<BankAccount>) => {
  const accountId = shortid();
  const bankaccount: BankAccount = {
    id: accountId,
    uuid: v4(),
    userId,
    bankName: accountDetails.bankName!,
    accountNumber: accountDetails.accountNumber!,
    routingNumber: accountDetails.routingNumber!,
    isDeleted: false,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  // Write bank account record to the database
  const result = createBankAccount(bankaccount);

  return result;
};

export const removeBankAccountById = (bankAccountId: string) => {
  db.get(BANK_ACCOUNT_TABLE)
    .find({ id: bankAccountId })
    .assign({ isDeleted: true }) // soft delete
    .write();
};

// Bank Transfer
// Note: Balance transfers from/to bank accounts is a future feature,
// but some of the backend database functionality is already implemented here.

/* istanbul ignore next */
export const getBankTransferBy = (key: string, value: any) =>
  getBy(BANK_TRANSFER_TABLE, key, value);

export const getBankTransfersBy = (key: string, value: any) =>
  getAllBy(BANK_TRANSFER_TABLE, key, value);

export const getBankTransfersByUserId = (userId: string) => getBankTransfersBy("userId", userId);

/* istanbul ignore next */
export const createBankTransfer = (bankTransferDetails: BankTransferPayload) => {
  const bankTransfer: BankTransfer = {
    id: shortid(),
    uuid: v4(),
    ...bankTransferDetails,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  const savedBankTransfer = saveBankTransfer(bankTransfer);
  return savedBankTransfer;
};

/* istanbul ignore next */
const saveBankTransfer = (bankTransfer: BankTransfer): BankTransfer => {
  db.get(BANK_TRANSFER_TABLE).push(bankTransfer).write();

  // manual lookup after banktransfer created
  return getBankTransferBy("id", bankTransfer.id);
};

// Transaction

export const getTransactionBy = (key: string, value: any) => getBy(TRANSACTION_TABLE, key, value);

export const getTransactionById = (id: string) => getTransactionBy("id", id);

export const getTransactionsByObj = (query: object) => getAllByObj(TRANSACTION_TABLE, query);

export const getTransactionByIdForApi = (id: string) =>
  formatTransactionForApiResponse(getTransactionBy("id", id));

export const getTransactionsForUserForApi = (userId: string, query?: object) =>
  flow(getTransactionsForUserByObj(userId), formatTransactionsForApiResponse)(query);

export const getFullNameForUser = (userId: User["id"]) => flow(getUserById, formatFullName)(userId);

export const formatTransactionForApiResponse = (
  transaction: Transaction
): TransactionResponseItem => {
  const receiver = getUserById(transaction.receiverId);
  const sender = getUserById(transaction.senderId);

  const receiverName = getFullNameForUser(transaction.receiverId);
  const senderName = getFullNameForUser(transaction.senderId);
  const likes = getLikesByTransactionId(transaction.id);
  const comments = getCommentsByTransactionId(transaction.id);

  return {
    receiverName,
    senderName,
    receiverAvatar: receiver.avatar,
    senderAvatar: sender.avatar,
    likes,
    comments,
    ...transaction,
  };
};

export const formatTransactionsForApiResponse = (
  transactions: Transaction[]
): TransactionResponseItem[] =>
  orderBy(
    [(transaction: Transaction) => new Date(transaction.modifiedAt)],
    ["desc"],
    transactions.map((transaction) => formatTransactionForApiResponse(transaction))
  );

export const getAllTransactionsForUserByObj = curry((userId: string, query?: object) => {
  const queryWithoutFilterFields = query && getQueryWithoutFilterFields(query);

  const queryFields = queryWithoutFilterFields || query;

  const userTransactions = flatMap(getTransactionsByObj)([
    {
      receiverId: userId,
      ...queryFields,
    },
    {
      senderId: userId,
      ...queryFields,
    },
  ]);

  if (query && (hasDateQueryFields(query) || hasAmountQueryFields(query))) {
    const { dateRangeStart, dateRangeEnd } = getDateQueryFields(query);
    const { amountMin, amountMax } = getAmountQueryFields(query);

    return flow(
      transactionsWithinDateRange(dateRangeStart!, dateRangeEnd!),
      transactionsWithinAmountRange(amountMin!, amountMax!)
    )(userTransactions);
  }
  return userTransactions;
});

export const transactionsWithinAmountRange = curry(
  (amountMin: number, amountMax: number, transactions: Transaction[]) => {
    if (!amountMin || !amountMax) {
      return transactions;
    }

    return filter(
      (transaction: Transaction) => inRange(amountMin, amountMax, transaction.amount),
      transactions
    );
  }
);

export const transactionsWithinDateRange = curry(
  (dateRangeStart: string, dateRangeEnd: string, transactions: Transaction[]) => {
    if (!dateRangeStart || !dateRangeEnd) {
      return transactions;
    }

    return filter(
      (transaction: Transaction) =>
        isWithinInterval(new Date(transaction.createdAt), {
          start: new Date(dateRangeStart),
          end: new Date(dateRangeEnd),
        }),
      transactions
    );
  }
);

export const getTransactionsForUserByObj = curry((userId: string, query?: object) =>
  flow(getAllTransactionsForUserByObj(userId), uniqBy("id"))(query)
);

export const getContactIdsForUser = (userId: string): Contact["id"][] =>
  flow(getContactsByUserId, map("contactUserId"))(userId);

export const getTransactionsForUserContacts = (userId: string, query?: object) =>
  uniqBy(
    "id",
    flatMap(
      (contactId) => getTransactionsForUserForApi(contactId, query),
      getContactIdsForUser(userId)
    )
  );

export const getTransactionIds = (transactions: Transaction[]) => map("id", transactions);

export const getContactsTransactionIds = (userId: string): Transaction["id"][] =>
  flow(getTransactionsForUserContacts, getTransactionIds)(userId);

export const nonContactPublicTransactions = (userId: string): Transaction[] => {
  const contactsTransactionIds = getContactsTransactionIds(userId);
  return flow(
    getAllPublicTransactions,
    reject((transaction: Transaction) => includes(transaction.id, contactsTransactionIds))
  )();
};

export const getNonContactPublicTransactionsForApi = (userId: string) =>
  flow(nonContactPublicTransactions, formatTransactionsForApiResponse)(userId);

export const getPublicTransactionsDefaultSort = (userId: string) => ({
  contactsTransactions: getTransactionsForUserContacts(userId),
  publicTransactions: getNonContactPublicTransactionsForApi(userId),
});

export const getPublicTransactionsByQuery = (userId: string, query: TransactionQueryPayload) => {
  if (query && (hasDateQueryFields(query) || hasAmountQueryFields(query))) {
    const { dateRangeStart, dateRangeEnd } = getDateQueryFields(query);
    const { amountMin, amountMax } = getAmountQueryFields(query);

    return {
      contactsTransactions: getTransactionsForUserContacts(userId, query),
      publicTransactions: flow(
        transactionsWithinDateRange(dateRangeStart!, dateRangeEnd!),
        transactionsWithinAmountRange(amountMin!, amountMax!)
      )(getNonContactPublicTransactionsForApi(userId)),
    };
  } else {
    return {
      contactsTransactions: getTransactionsForUserContacts(userId),
      publicTransactions: getNonContactPublicTransactionsForApi(userId),
    };
  }
};

export const resetPayAppBalance = constant(0);

export const debitPayAppBalance = (user: User, transaction: Transaction) => {
  if (hasSufficientFunds(user, transaction)) {
    flow(getChargeAmount, savePayAppBalance(user))(user, transaction);
  } else {
    /* istanbul ignore next */
    flow(
      getTransferAmount(user),
      createBankTransferWithdrawal(user, transaction),
      resetPayAppBalance,
      savePayAppBalance(user)
    )(transaction);
  }
};

export const creditPayAppBalance = (user: User, transaction: Transaction) =>
  flow(getPayAppCreditedAmount, savePayAppBalance(user))(user, transaction);

/* istanbul ignore next */
export const createBankTransferWithdrawal = curry(
  (sender: User, transaction: Transaction, transferAmount: number) =>
    createBankTransfer({
      userId: sender.id,
      source: transaction.source,
      amount: transferAmount,
      transactionId: transaction.id,
      type: BankTransferType.withdrawal,
    })
);

export const savePayAppBalance = curry((sender: User, balance: number) =>
  updateUserById(get("id", sender), { balance })
);

export const createTransaction = (
  userId: User["id"],
  transactionType: "payment" | "request",
  transactionDetails: TransactionPayload
): Transaction => {
  const sender = getUserById(userId);
  const receiver = getUserById(transactionDetails.receiverId);
  const transaction: Transaction = {
    id: shortid(),
    uuid: v4(),
    source: transactionDetails.source,
    amount: transactionDetails.amount * 100,
    description: transactionDetails.description,
    receiverId: transactionDetails.receiverId,
    senderId: userId,
    privacyLevel: transactionDetails.privacyLevel || sender.defaultPrivacyLevel,
    status: TransactionStatus.pending,
    requestStatus: transactionType === "request" ? TransactionRequestStatus.pending : undefined,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  const savedTransaction = saveTransaction(transaction);

  // if payment, debit sender's balance for payment amount
  if (isPayment(transaction)) {
    debitPayAppBalance(sender, transaction);
    creditPayAppBalance(receiver, transaction);
    updateTransactionById(transaction.id, {
      status: TransactionStatus.complete,
    });
    createPaymentNotification(
      transaction.receiverId,
      transaction.id,
      PaymentNotificationStatus.received
    );
  } else {
    createPaymentNotification(
      transaction.receiverId,
      transaction.id,
      PaymentNotificationStatus.requested
    );
  }

  return savedTransaction;
};

const saveTransaction = (transaction: Transaction): Transaction => {
  db.get(TRANSACTION_TABLE).push(transaction).write();

  // manual lookup after transaction created
  return getTransactionBy("id", transaction.id);
};

export const updateTransactionById = (transactionId: string, edits: Partial<Transaction>) => {
  const transaction = getTransactionBy("id", transactionId);
  const { senderId, receiverId } = transaction;
  const sender = getUserById(senderId);
  const receiver = getUserById(receiverId);

  // if payment, debit sender's balance for payment amount
  if (isRequestTransaction(transaction)) {
    debitPayAppBalance(receiver, transaction);
    creditPayAppBalance(sender, transaction);
    edits.status = TransactionStatus.complete;

    createPaymentNotification(
      transaction.senderId,
      transaction.id,
      PaymentNotificationStatus.received
    );
  }

  db.get(TRANSACTION_TABLE).find(transaction).assign(edits).write();
};

// Likes

export const getLikeBy = (key: string, value: any): Like => getBy(LIKE_TABLE, key, value);
export const getLikesByObj = (query: object) => getAllByObj(LIKE_TABLE, query);

export const getLikeById = (id: string): Like => getLikeBy("id", id);
export const getLikesByTransactionId = (transactionId: string) => getLikesByObj({ transactionId });

export const createLike = (userId: string, transactionId: string): Like => {
  const like = {
    id: shortid(),
    uuid: v4(),
    userId,
    transactionId,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  const savedLike = saveLike(like);
  return savedLike;
};

export const createLikes = (userId: string, transactionId: string) => {
  const { senderId, receiverId } = getTransactionById(transactionId);

  const like = createLike(userId, transactionId);

  /* istanbul ignore next */
  if (userId !== senderId || userId !== receiverId) {
    createLikeNotification(senderId, transactionId, like.id);
    createLikeNotification(receiverId, transactionId, like.id);
  } else if (userId === senderId) {
    createLikeNotification(senderId, transactionId, like.id);
  } else {
    createLikeNotification(receiverId, transactionId, like.id);
  }
};

const saveLike = (like: Like): Like => {
  db.get(LIKE_TABLE).push(like).write();

  // manual lookup after like created
  return getLikeById(like.id);
};

// Comments

export const getCommentBy = (key: string, value: any): Comment => getBy(COMMENT_TABLE, key, value);
export const getCommentsByObj = (query: object) => getAllByObj(COMMENT_TABLE, query);

export const getCommentById = (id: string): Comment => getCommentBy("id", id);
export const getCommentsByTransactionId = (transactionId: string) =>
  getCommentsByObj({ transactionId });

export const createComment = (userId: string, transactionId: string, content: string): Comment => {
  const comment = {
    id: shortid(),
    uuid: v4(),
    content,
    userId,
    transactionId,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  const savedComment = saveComment(comment);
  return savedComment;
};

export const createComments = (userId: string, transactionId: string, content: string) => {
  const { senderId, receiverId } = getTransactionById(transactionId);

  const comment = createComment(userId, transactionId, content);

  /* istanbul ignore next */
  if (userId !== senderId || userId !== receiverId) {
    createCommentNotification(senderId, transactionId, comment.id);
    createCommentNotification(receiverId, transactionId, comment.id);
  } else if (userId === senderId) {
    createCommentNotification(senderId, transactionId, comment.id);
  } else {
    createCommentNotification(receiverId, transactionId, comment.id);
  }
};

const saveComment = (comment: Comment): Comment => {
  db.get(COMMENT_TABLE).push(comment).write();

  // manual lookup after comment created
  return getCommentById(comment.id);
};

// Notifications

export const getNotificationBy = (key: string, value: any): NotificationType =>
  getBy(NOTIFICATION_TABLE, key, value);

export const getNotificationsByObj = (query: object): Notification[] =>
  getAllByObj(NOTIFICATION_TABLE, query);

export const getUnreadNotificationsByUserId = (userId: string) =>
  flow(getNotificationsByObj, formatNotificationsForApiResponse)({ userId, isRead: false });

export const createPaymentNotification = (
  userId: string,
  transactionId: string,
  status: PaymentNotificationStatus
): PaymentNotification => {
  const notification: PaymentNotification = {
    id: shortid(),
    uuid: v4(),
    userId: userId,
    transactionId: transactionId,
    status,
    isRead: false,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  saveNotification(notification);
  return notification;
};

export const createLikeNotification = (
  userId: string,
  transactionId: string,
  likeId: string
): LikeNotification => {
  const notification: LikeNotification = {
    id: shortid(),
    uuid: v4(),
    userId: userId,
    transactionId: transactionId,
    likeId: likeId,
    isRead: false,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  saveNotification(notification);
  return notification;
};

export const createCommentNotification = (
  userId: string,
  transactionId: string,
  commentId: string
): CommentNotification => {
  const notification: CommentNotification = {
    id: shortid(),
    uuid: v4(),
    userId: userId,
    transactionId: transactionId,
    commentId: commentId,
    isRead: false,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  saveNotification(notification);
  return notification;
};

const saveNotification = (notification: NotificationType) => {
  db.get(NOTIFICATION_TABLE).push(notification).write();
};

export const createNotifications = (userId: string, notifications: NotificationPayloadType[]) =>
  notifications.flatMap((item: NotificationPayloadType) => {
    if ("status" in item && item.type === NotificationsType.payment) {
      return createPaymentNotification(userId, item.transactionId, item.status);
    } else if ("likeId" in item && item.type === NotificationsType.like) {
      return createLikeNotification(userId, item.transactionId, item.likeId);
    } else {
      /* istanbul ignore next */
      if ("commentId" in item) {
        return createCommentNotification(userId, item.transactionId, item.commentId);
      }
    }
  });

export const updateNotificationById = (
  userId: string,
  notificationId: string,
  edits: Partial<NotificationType>
) => {
  const notification = getNotificationBy("id", notificationId);

  db.get(NOTIFICATION_TABLE).find(notification).assign(edits).write();
};

export const formatNotificationForApiResponse = (
  notification: NotificationType
): NotificationResponseItem => {
  let userFullName = getFullNameForUser(notification.userId);
  const transaction = getTransactionById(notification.transactionId);

  if (isRequestTransaction(transaction)) {
    userFullName = getFullNameForUser(transaction.senderId);
  }

  if (isLikeNotification(notification)) {
    const like = getLikeById(notification.likeId);
    userFullName = getFullNameForUser(like.userId);
  }

  if (isCommentNotification(notification)) {
    const comment = getCommentById(notification.commentId);
    userFullName = getFullNameForUser(comment.userId);
  }

  return {
    userFullName,
    ...notification,
  };
};

export const formatNotificationsForApiResponse = (
  notifications: NotificationResponseItem[]
): NotificationResponseItem[] =>
  orderBy(
    [(notification: NotificationResponseItem) => new Date(notification.modifiedAt)],
    ["desc"],
    notifications.map((notification) => formatNotificationForApiResponse(notification))
  );

// dev/test private methods
/* istanbul ignore next */
export const getRandomUser = () => {
  const users = getAllUsers();
  return sample(users)!;
};

/* istanbul ignore next */
export const getAllContacts = () => db.get(CONTACT_TABLE).value();

/* istanbul ignore next */
export const getAllTransactions = () => db.get(TRANSACTION_TABLE).value();

/* istanbul ignore */
export const getBankAccountsByUserId = (userId: string) => getBankAccountsBy("userId", userId);

/* istanbul ignore next */
export const getNotificationById = (id: string): NotificationType => getNotificationBy("id", id);

/* istanbul ignore next */
export const getNotificationsByUserId = (userId: string) => getNotificationsByObj({ userId });

/* istanbul ignore next */
export const getBankTransferByTransactionId = (transactionId: string) =>
  getBankTransferBy("transactionId", transactionId);

/* istanbul ignore next */
export const getTransactionsBy = (key: string, value: string) =>
  getAllBy(TRANSACTION_TABLE, key, value);

/* istanbul ignore next */
export const getTransactionsByUserId = (userId: string) => getTransactionsBy("receiverId", userId);


export default db;

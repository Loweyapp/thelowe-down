import React, { useState, useRef } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { C, TYPE_COLOR, todayStr } from '../constants.js';
import { Card, Btn } from '../components/UI.js';

const MAY_2026 = [
  { date:'2026-05-01', description:'Ryanair tea',                   category:'Holiday & Travel', amount:-3.25,   type:'expense', account:'Alex'  },
  { date:'2026-05-02', description:'Vinted earnings',               category:'Income',           amount:23.74,   type:'income',  account:'Kelly' },
  { date:'2026-05-03', description:"Alex's Riga trip expenses",     category:'Holiday & Travel', amount:-420.00, type:'expense', account:'Alex'  },
  { date:'2026-05-03', description:'Riga - Kelly cash',             category:'Holiday & Travel', amount:-46.00,  type:'expense', account:'Kelly' },
  { date:'2026-05-03', description:'Riga - Kelly Monzo',            category:'Holiday & Travel', amount:-25.20,  type:'expense', account:'Kelly' },
  { date:'2026-05-03', description:'Chinese takeaway',              category:'Dining Out',       amount:-31.40,  type:'expense', account:'Kelly' },
  { date:'2026-05-04', description:'Alex tube',                     category:'Transport',        amount:-7.20,   type:'expense', account:'Alex'  },
  { date:'2026-05-04', description:'K festival - snacks',           category:'Dining Out',       amount:-18.30,  type:'expense', account:'Kelly' },
  { date:'2026-05-04', description:'Korean food & Ginseng tea',     category:'Groceries',        amount:-47.66,  type:'expense', account:'Kelly' },
  { date:'2026-05-04', description:'Kelly tube',                    category:'Transport',        amount:-7.20,   type:'expense', account:'Kelly' },
  { date:'2026-05-05', description:'Cinema popcorn',                category:'Entertainment',    amount:-14.61,  type:'expense', account:'Alex'  },
  { date:'2026-05-05', description:'Alex tube',                     category:'Transport',        amount:-10.70,  type:'expense', account:'Alex'  },
  { date:'2026-05-06', description:'Parking',                       category:'Transport',        amount:-3.00,   type:'expense', account:'Alex'  },
  { date:'2026-05-06', description:'M&S',                           category:'Groceries',        amount:-5.86,   type:'expense', account:'Kelly' },
  { date:'2026-05-07', description:'Alex Audible',                  category:'Entertainment',    amount:-4.49,   type:'expense', account:'Alex'  },
  { date:'2026-05-07', description:'Kelly tube',                    category:'Transport',        amount:-7.20,   type:'expense', account:'Kelly' },
  { date:'2026-05-07', description:'Kelly tube',                    category:'Transport',        amount:-3.60,   type:'expense', account:'Kelly' },
  { date:'2026-05-07', description:'Hand soap wash',                category:'Shopping',         amount:-40.60,  type:'expense', account:'Alex'  },
  { date:'2026-05-07', description:'International supermarket',     category:'Groceries',        amount:-1.99,   type:'expense', account:'Alex'  },
  { date:'2026-05-07', description:'Snacks',                        category:'Groceries',        amount:-57.70,  type:'expense', account:'Alex'  },
  { date:'2026-05-07', description:'Alex History podcast',          category:'Entertainment',    amount:-7.99,   type:'expense', account:'Alex'  },
  { date:'2026-05-08', description:'Stansted drop off',             category:'Transport',        amount:-10.00,  type:'expense', account:'Alex'  },
  { date:'2026-05-08', description:'Lebara phone plan',             category:'Subscriptions',    amount:-3.00,   type:'expense', account:'Kelly' },
  { date:'2026-05-08', description:"Gordon's wine bar",             category:'Dining Out',       amount:-63.74,  type:'expense', account:'Kelly' },
  { date:'2026-05-08', description:'Kelly tube',                    category:'Transport',        amount:-7.80,   type:'expense', account:'Kelly' },
  { date:'2026-05-09', description:'COSTCO',                        category:'Groceries',        amount:-126.28, type:'expense', account:'Alex'  },
  { date:'2026-05-09', description:'Flowers for garden',            category:'Home & Garden',    amount:-37.71,  type:'expense', account:'Alex'  },
  { date:'2026-05-09', description:"Sainsbury's",                   category:'Groceries',        amount:-19.20,  type:'expense', account:'Alex'  },
  { date:'2026-05-09', description:'Tesco',                         category:'Groceries',        amount:-10.10,  type:'expense', account:'Alex'  },
  { date:'2026-05-09', description:'International supermarket',     category:'Groceries',        amount:-6.06,   type:'expense', account:'Kelly' },
  { date:'2026-05-09', description:"Sainsbury's savings card",      category:'Groceries',        amount:-102.30, type:'expense', account:'Kelly' },
  { date:'2026-05-11', description:'Drop off at Gatwick',           category:'Transport',        amount:-20.00,  type:'expense', account:'Alex'  },
  { date:'2026-05-11', description:'Car cleaning',                  category:'Car',              amount:-35.00,  type:'expense', account:'Alex'  },
  { date:'2026-05-12', description:'Dart bridge charge',            category:'Transport',        amount:-7.00,   type:'expense', account:'Alex'  },
  { date:'2026-05-12', description:'Patreon channel',               category:'Entertainment',    amount:-9.60,   type:'expense', account:'Alex'  },
  { date:'2026-05-13', description:'Alex glasses and eye check',    category:'Health & Medical', amount:-240.00, type:'expense', account:'Alex'  },
  { date:'2026-05-13', description:'Kelly paid Sudeng - Sapphire',  category:'Holiday & Travel', amount:-262.72, type:'expense', account:'Kelly' },
];

const APR_2026 = [
  { date:'2026-04-01', description:'Alex takeaway kebab',              category:'Dining Out',        amount:-6.80,   type:'expense', account:'Alex'  },
  { date:'2026-04-02', description:'Alex ear buds',                    category:'Shopping',          amount:-35.68,  type:'expense', account:'Alex'  },
  { date:'2026-04-02', description:'Heathrow parking',                 category:'Transport',         amount:-8.00,   type:'expense', account:'Alex'  },
  { date:'2026-04-03', description:"Sainsbury's savings card",         category:'Groceries',         amount:-95.50,  type:'expense', account:'Kelly' },
  { date:'2026-04-03', description:'International supermarket',        category:'Groceries',         amount:-4.37,   type:'expense', account:'Alex'  },
  { date:'2026-04-03', description:'Waitrose',                         category:'Groceries',         amount:-24.96,  type:'expense', account:'Alex'  },
  { date:'2026-04-04', description:'Alex history book',                category:'Shopping',          amount:-10.40,  type:'expense', account:'Alex'  },
  { date:'2026-04-04', description:'Tesco',                            category:'Groceries',         amount:-19.84,  type:'expense', account:'Alex'  },
  { date:'2026-04-04', description:'Alex Audible',                     category:'Entertainment',     amount:-3.79,   type:'expense', account:'Alex'  },
  { date:'2026-04-06', description:'Alex book shopping',               category:'Shopping',          amount:-22.87,  type:'expense', account:'Alex'  },
  { date:'2026-04-06', description:'Hotel in Japan',                   category:'Holiday & Travel',  amount:-152.94, type:'expense', account:'Alex'  },
  { date:'2026-04-07', description:'Music stand',                      category:'Entertainment',     amount:-9.94,   type:'expense', account:'Alex'  },
  { date:'2026-04-07', description:"Sainsbury's",                      category:'Groceries',         amount:-40.34,  type:'expense', account:'Alex'  },
  { date:'2026-04-07', description:'Alex podcast subscription',        category:'Entertainment',     amount:-7.99,   type:'expense', account:'Alex'  },
  { date:'2026-04-07', description:'Alex Audible',                     category:'Entertainment',     amount:-8.99,   type:'expense', account:'Alex'  },
  { date:'2026-04-07', description:'Kelly tube',                       category:'Transport',         amount:-8.40,   type:'expense', account:'Kelly' },
  { date:'2026-04-08', description:'Call to Korea',                    category:'Bills & Utilities', amount:-0.99,   type:'expense', account:'Kelly' },
  { date:'2026-04-09', description:'Alex ear buds',                    category:'Shopping',          amount:-6.19,   type:'expense', account:'Alex'  },
  { date:'2026-04-09', description:'Call to Korea',                    category:'Bills & Utilities', amount:-0.99,   type:'expense', account:'Kelly' },
  { date:'2026-04-09', description:'Kelly tube',                       category:'Transport',         amount:-7.20,   type:'expense', account:'Kelly' },
  { date:'2026-04-09', description:'Kelly dinner and drinks',          category:'Dining Out',        amount:-52.37,  type:'expense', account:'Kelly' },
  { date:'2026-04-10', description:'Pub with Rob',                     category:'Dining Out',        amount:-36.65,  type:'expense', account:'Alex'  },
  { date:'2026-04-10', description:'Kelly and Alex El Dudley dinner',  category:'Dining Out',        amount:-187.15, type:'expense', account:'Kelly' },
  { date:'2026-04-11', description:'Tesco',                            category:'Groceries',         amount:-24.93,  type:'expense', account:'Alex'  },
  { date:'2026-04-11', description:'Alex tube',                        category:'Transport',         amount:-7.20,   type:'expense', account:'Alex'  },
  { date:'2026-04-11', description:'Alex lunch',                       category:'Dining Out',        amount:-18.50,  type:'expense', account:'Alex'  },
  { date:'2026-04-11', description:'Kelly tube',                       category:'Transport',         amount:-5.90,   type:'expense', account:'Kelly' },
  { date:'2026-04-11', description:'Kelly Bolt',                       category:'Transport',         amount:-13.11,  type:'expense', account:'Kelly' },
  { date:'2026-04-12', description:"Sainsbury's",                      category:'Groceries',         amount:-32.35,  type:'expense', account:'Alex'  },
  { date:'2026-04-12', description:'Kelly tube',                       category:'Transport',         amount:-7.00,   type:'expense', account:'Kelly' },
  { date:'2026-04-13', description:"Sainsbury's savings card",         category:'Groceries',         amount:-95.50,  type:'expense', account:'Kelly' },
  { date:'2026-04-13', description:'Kelly Libera phone bill',          category:'Subscriptions',     amount:-5.00,   type:'expense', account:'Kelly' },
  { date:'2026-04-13', description:'Paints',                           category:'Shopping',          amount:-5.99,   type:'expense', account:'Alex'  },
  { date:'2026-04-13', description:'Bird poo remover',                 category:'Car',               amount:-16.99,  type:'expense', account:'Alex'  },
  { date:'2026-04-13', description:'Alex Jazz cafe',                   category:'Dining Out',        amount:-36.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-13', description:'Alex kebab',                       category:'Dining Out',        amount:-12.90,  type:'expense', account:'Alex'  },
  { date:'2026-04-13', description:'Modeling content',                 category:'Entertainment',     amount:-9.60,   type:'expense', account:'Alex'  },
  { date:'2026-04-14', description:'Kelly coffee',                     category:'Dining Out',        amount:-4.45,   type:'expense', account:'Kelly' },
  { date:'2026-04-14', description:'Temu - shopping organising',       category:'Shopping',          amount:-9.58,   type:'expense', account:'Kelly' },
  { date:'2026-04-14', description:"Sainsbury's",                      category:'Groceries',         amount:-9.66,   type:'expense', account:'Kelly' },
  { date:'2026-04-14', description:'Kelly tube',                       category:'Transport',         amount:-7.20,   type:'expense', account:'Kelly' },
  { date:'2026-04-15', description:'Pub',                              category:'Dining Out',        amount:-26.30,  type:'expense', account:'Alex'  },
  { date:'2026-04-15', description:'Temu',                             category:'Shopping',          amount:-0.58,   type:'expense', account:'Kelly' },
  { date:'2026-04-16', description:'Alex to watch gig',                category:'Entertainment',     amount:-27.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-16', description:"Dad's birthday gift",              category:'Shopping',          amount:-27.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-16', description:'Alex tube',                        category:'Transport',         amount:-8.40,   type:'expense', account:'Alex'  },
  { date:'2026-04-16', description:'Alex drinks with colleagues',      category:'Dining Out',        amount:-51.35,  type:'expense', account:'Alex'  },
  { date:'2026-04-16', description:'Internet broadband',               category:'Bills & Utilities', amount:-40.04,  type:'expense', account:'Alex'  },
  { date:'2026-04-16', description:'Apple storage fee',                category:'Subscriptions',     amount:-2.99,   type:'expense', account:'Kelly' },
  { date:'2026-04-16', description:'Vinted earnings',                  category:'Income',            amount:60.00,   type:'income',  account:'Kelly' },
  { date:'2026-04-17', description:'Alex drinks',                      category:'Dining Out',        amount:-1.35,   type:'expense', account:'Alex'  },
  { date:'2026-04-17', description:'Alex work lunch',                  category:'Dining Out',        amount:-5.90,   type:'expense', account:'Alex'  },
  { date:'2026-04-17', description:'Modeling content',                 category:'Entertainment',     amount:-4.80,   type:'expense', account:'Alex'  },
  { date:'2026-04-17', description:'Kelly lunch with Cecilie',         category:'Dining Out',        amount:-19.00,  type:'expense', account:'Kelly' },
  { date:'2026-04-17', description:'Kelly dinner with friends',        category:'Dining Out',        amount:-23.35,  type:'expense', account:'Kelly' },
  { date:'2026-04-17', description:'Kelly tube',                       category:'Transport',         amount:-7.20,   type:'expense', account:'Kelly' },
  { date:'2026-04-18', description:"Kelly's gift for dad",             category:'Shopping',          amount:-50.00,  type:'expense', account:'Kelly' },
  { date:'2026-04-18', description:'Hand soap and cream',              category:'Shopping',          amount:-21.99,  type:'expense', account:'Alex'  },
  { date:'2026-04-18', description:"Alex's socks",                     category:'Shopping',          amount:-38.95,  type:'expense', account:'Alex'  },
  { date:'2026-04-18', description:'Alex coffee',                      category:'Groceries',         amount:-15.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-18', description:'Gift for KOR',                     category:'Shopping',          amount:-35.43,  type:'expense', account:'Alex'  },
  { date:'2026-04-18', description:'Cakes',                            category:'Dining Out',        amount:-7.00,   type:'expense', account:'Alex'  },
  { date:'2026-04-19', description:'Cat toy',                          category:'Shopping',          amount:-6.62,   type:'expense', account:'Alex'  },
  { date:'2026-04-19', description:'Lebara phone plan',                category:'Subscriptions',     amount:-5.00,   type:'expense', account:'Alex'  },
  { date:'2026-04-19', description:"Upfront bill for Kelly's bday",    category:'Dining Out',        amount:-60.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-20', description:"Takeaway for dad's birthday",      category:'Shopping',          amount:-94.50,  type:'expense', account:'Alex'  },
  { date:'2026-04-20', description:'Vinted earnings',                  category:'Income',            amount:40.00,   type:'income',  account:'Kelly' },
  { date:'2026-04-21', description:'Stansted airport parking',         category:'Transport',         amount:-41.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-22', description:'Alex app',                         category:'Entertainment',     amount:-7.00,   type:'expense', account:'Alex'  },
  { date:'2026-04-22', description:'Leaving gift',                     category:'Shopping',          amount:-5.00,   type:'expense', account:'Alex'  },
  { date:'2026-04-22', description:'Tesco',                            category:'Groceries',         amount:-7.33,   type:'expense', account:'Kelly' },
  { date:'2026-04-23', description:'Alex drinks with Tom',             category:'Dining Out',        amount:-37.40,  type:'expense', account:'Alex'  },
  { date:'2026-04-23', description:'Bed payment installment',          category:'Home & Garden',     amount:-75.70,  type:'expense', account:'Alex'  },
  { date:'2026-04-24', description:'Alex tube',                        category:'Transport',         amount:-4.80,   type:'expense', account:'Alex'  },
  { date:'2026-04-24', description:'Uber home',                        category:'Transport',         amount:-31.67,  type:'expense', account:'Alex'  },
  { date:'2026-04-24', description:'Kelly tube',                       category:'Transport',         amount:-4.80,   type:'expense', account:'Kelly' },
  { date:'2026-04-25', description:'Alex book shopping',               category:'Shopping',          amount:-13.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-25', description:'Drinks',                           category:'Dining Out',        amount:-41.80,  type:'expense', account:'Alex'  },
  { date:'2026-04-25', description:'Alex tube',                        category:'Transport',         amount:-7.20,   type:'expense', account:'Alex'  },
  { date:'2026-04-25', description:"Kelly's birthday dinner",          category:'Dining Out',        amount:-159.88, type:'expense', account:'Alex'  },
  { date:'2026-04-25', description:'Taxi - pay to Lorie',              category:'Transport',         amount:-30.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-25', description:'Kelly tube',                       category:'Transport',         amount:-7.20,   type:'expense', account:'Kelly' },
  { date:'2026-04-26', description:'Petrol',                           category:'Car',               amount:-15.03,  type:'expense', account:'Alex'  },
  { date:'2026-04-26', description:'COSTCO',                           category:'Groceries',         amount:-135.76, type:'expense', account:'Alex'  },
  { date:'2026-04-26', description:'Colombia Road flowers',            category:'Home & Garden',     amount:-36.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-26', description:"Sainsbury's",                      category:'Groceries',         amount:-26.68,  type:'expense', account:'Alex'  },
  { date:'2026-04-26', description:'Shopping',                         category:'Groceries',         amount:-12.05,  type:'expense', account:'Alex'  },
  { date:'2026-04-27', description:'Light bulbs',                      category:'Home & Garden',     amount:-24.97,  type:'expense', account:'Alex'  },
  { date:'2026-04-27', description:'M&S',                              category:'Groceries',         amount:-3.50,   type:'expense', account:'Alex'  },
  { date:'2026-04-27', description:"Sainsbury's",                      category:'Groceries',         amount:-1.99,   type:'expense', account:'Alex'  },
  { date:'2026-04-27', description:'HSBC bank fee',                    category:'Bills & Utilities', amount:-11.95,  type:'expense', account:'Alex'  },
  { date:'2026-04-27', description:'Flowers for garden',               category:'Home & Garden',     amount:-25.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-27', description:"Kelly's birthday cake",            category:'Shopping',          amount:-35.95,  type:'expense', account:'Alex'  },
  { date:'2026-04-28', description:'Alex salary',                      category:'Income',            amount:3581.28, type:'income',  account:'Alex'  },
  { date:'2026-04-28', description:'Stansted drop off for mum',        category:'Transport',         amount:-10.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-28', description:'Gift',                             category:'Shopping',          amount:-9.99,   type:'expense', account:'Alex'  },
  { date:'2026-04-28', description:"F&M gift for Nora's family",       category:'Shopping',          amount:-30.20,  type:'expense', account:'Kelly' },
  { date:'2026-04-28', description:'Kelly tube',                       category:'Transport',         amount:-11.50,  type:'expense', account:'Kelly' },
  { date:'2026-04-29', description:'Claude subscription',              category:'Subscriptions',     amount:-18.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-29', description:'House rent',                       category:'Bills & Utilities', amount:-500.00, type:'expense', account:'Alex'  },
  { date:'2026-04-30', description:'Alex hair product',                category:'Shopping',          amount:-2.20,   type:'expense', account:'Alex'  },
  { date:'2026-04-30', description:'Alex breakfast at Stansted',       category:'Dining Out',        amount:-16.25,  type:'expense', account:'Alex'  },
  { date:'2026-04-30', description:'Kelly breakfast at Stansted',      category:'Dining Out',        amount:-12.50,  type:'expense', account:'Kelly' },
];

const MAR_2026 = [
  { date:'2026-03-01', description:'Tesco',                            category:'Groceries',        amount:-5.05,   type:'expense', account:'Alex'  },
  { date:'2026-03-02', description:'Tesco',                            category:'Groceries',        amount:-4.50,   type:'expense', account:'Alex'  },
  { date:'2026-03-03', description:"Steve's bday card",                category:'Shopping',         amount:-4.99,   type:'expense', account:'Alex'  },
  { date:'2026-03-03', description:'Water n snaks',                    category:'Groceries',        amount:-3.05,   type:'expense', account:'Alex'  },
  { date:'2026-03-03', description:'Kelly Tenerife medicine/gifts',    category:'Holiday & Travel', amount:-52.44,  type:'expense', account:'Kelly' },
  { date:'2026-03-03', description:'Kelly Tenerife rent car/food',     category:'Holiday & Travel', amount:-262.97, type:'expense', account:'Kelly' },
  { date:'2026-03-04', description:'Collectable stuff',                category:'Entertainment',    amount:-52.00,  type:'expense', account:'Alex'  },
  { date:'2026-03-04', description:'Tesco',                            category:'Groceries',        amount:-12.54,  type:'expense', account:'Alex'  },
  { date:'2026-03-05', description:"Sainsbury's",                      category:'Groceries',        amount:-30.00,  type:'expense', account:'Alex'  },
  { date:'2026-03-05', description:'Stansted parking',                 category:'Transport',        amount:-7.00,   type:'expense', account:'Alex'  },
  { date:'2026-03-06', description:'Kelly tube',                       category:'Transport',        amount:-7.20,   type:'expense', account:'Kelly' },
  { date:'2026-03-06', description:'Alex dinner with friends',         category:'Dining Out',       amount:-37.00,  type:'expense', account:'Alex'  },
  { date:'2026-03-06', description:'Kelly drinks with friends',        category:'Dining Out',       amount:-14.70,  type:'expense', account:'Kelly' },
  { date:'2026-03-07', description:"Drinks at Alex's gig",             category:'Dining Out',       amount:-41.25,  type:'expense', account:'Alex'  },
  { date:'2026-03-07', description:'Tesco',                            category:'Groceries',        amount:-5.22,   type:'expense', account:'Alex'  },
  { date:'2026-03-07', description:'Alex History podcast',             category:'Entertainment',    amount:-7.99,   type:'expense', account:'Alex'  },
  { date:'2026-03-07', description:'Alex Audible',                     category:'Entertainment',    amount:-8.99,   type:'expense', account:'Alex'  },
  { date:'2026-03-08', description:'Riga airbnb',                      category:'Holiday & Travel', amount:-200.00, type:'expense', account:'Alex'  },
  { date:'2026-03-08', description:'Tesco',                            category:'Groceries',        amount:-9.06,   type:'expense', account:'Alex'  },
  { date:'2026-03-08', description:"Sainsbury's savings card",         category:'Groceries',        amount:-95.50,  type:'expense', account:'Kelly' },
  { date:'2026-03-09', description:'Lebara rewards',                   category:'Income',           amount:10.00,   type:'income',  account:'Alex'  },
  { date:'2026-03-10', description:'Kelly tube',                       category:'Transport',        amount:-10.30,  type:'expense', account:'Kelly' },
  { date:'2026-03-10', description:'Kelly movie stuff',                category:'Entertainment',    amount:-11.98,  type:'expense', account:'Kelly' },
  { date:'2026-03-10', description:'Kelly coffee',                     category:'Dining Out',       amount:-4.30,   type:'expense', account:'Kelly' },
  { date:'2026-03-10', description:'Petrol',                           category:'Car',              amount:-78.23,  type:'expense', account:'Alex'  },
  { date:'2026-03-10', description:'Claude subscription',              category:'Subscriptions',    amount:-4.51,   type:'expense', account:'Alex'  },
  { date:'2026-03-11', description:'Kelly tube',                       category:'Transport',        amount:-7.20,   type:'expense', account:'Kelly' },
  { date:'2026-03-12', description:"Sainsbury's savings card",         category:'Groceries',        amount:-46.50,  type:'expense', account:'Kelly' },
  { date:'2026-03-12', description:'M&S',                              category:'Groceries',        amount:-0.10,   type:'expense', account:'Alex'  },
  { date:'2026-03-12', description:'Alex computer game',               category:'Entertainment',    amount:-34.99,  type:'expense', account:'Alex'  },
  { date:'2026-03-14', description:'Seoul plaza',                      category:'Groceries',        amount:-2.58,   type:'expense', account:'Kelly' },
  { date:'2026-03-14', description:'Kelly Libera phone bill',          category:'Subscriptions',    amount:-2.50,   type:'expense', account:'Kelly' },
  { date:'2026-03-14', description:'M&S gifts to Korea',               category:'Shopping',         amount:-27.90,  type:'expense', account:'Kelly' },
  { date:'2026-03-14', description:'Kelly tube',                       category:'Transport',        amount:-3.60,   type:'expense', account:'Kelly' },
  { date:'2026-03-15', description:'Alex computer game',               category:'Entertainment',    amount:-16.99,  type:'expense', account:'Alex'  },
  { date:'2026-03-15', description:"Sainsbury's",                      category:'Groceries',        amount:-50.72,  type:'expense', account:'Alex'  },
  { date:'2026-03-15', description:'Waitrose',                         category:'Groceries',        amount:-38.47,  type:'expense', account:'Alex'  },
  { date:'2026-03-16', description:'Apple storage fee',                category:'Subscriptions',    amount:-2.99,   type:'expense', account:'Kelly' },
  { date:'2026-03-16', description:'Gift to Korea',                    category:'Shopping',         amount:-6.95,   type:'expense', account:'Kelly' },
  { date:'2026-03-16', description:'Batteries',                        category:'Shopping',         amount:-3.99,   type:'expense', account:'Alex'  },
  { date:'2026-03-16', description:'Parking cinema',                   category:'Transport',        amount:-8.50,   type:'expense', account:'Alex'  },
  { date:'2026-03-16', description:'Internet broadband',               category:'Bills & Utilities',amount:-36.54,  type:'expense', account:'Alex'  },
  { date:'2026-03-17', description:'Alex gig',                         category:'Income',           amount:100.00,  type:'income',  account:'Alex'  },
  { date:'2026-03-17', description:'Alex Floy models membership',      category:'Entertainment',    amount:-4.80,   type:'expense', account:'Alex'  },
  { date:'2026-03-18', description:'Parking',                          category:'Transport',        amount:-7.00,   type:'expense', account:'Alex'  },
  { date:'2026-03-19', description:'Tesco',                            category:'Groceries',        amount:-25.20,  type:'expense', account:'Alex'  },
  { date:'2026-03-20', description:'Alex mobile charge',               category:'Subscriptions',    amount:-5.00,   type:'expense', account:'Alex'  },
  { date:'2026-03-21', description:'Railway thing',                    category:'Entertainment',    amount:-15.98,  type:'expense', account:'Alex'  },
  { date:'2026-03-21', description:'Petrol',                           category:'Car',              amount:-50.37,  type:'expense', account:'Alex'  },
  { date:'2026-03-21', description:'Tesco',                            category:'Groceries',        amount:-22.72,  type:'expense', account:'Alex'  },
  { date:'2026-03-22', description:'Claude subscription',              category:'Subscriptions',    amount:-18.00,  type:'expense', account:'Alex'  },
  { date:'2026-03-22', description:"Sainsbury's",                      category:'Groceries',        amount:-16.68,  type:'expense', account:'Alex'  },
  { date:'2026-03-22', description:"Nora's bday",                      category:'Shopping',         amount:-50.00,  type:'expense', account:'Alex'  },
  { date:'2026-03-23', description:'Hotel in Sapporo',                 category:'Holiday & Travel', amount:-128.28, type:'expense', account:'Alex'  },
  { date:'2026-03-23', description:'Parking for Railway show',         category:'Transport',        amount:-10.00,  type:'expense', account:'Alex'  },
  { date:'2026-03-23', description:'Bed payment installment',          category:'Home & Garden',    amount:-75.70,  type:'expense', account:'Alex'  },
  { date:'2026-03-24', description:'Film',                             category:'Entertainment',    amount:-5.99,   type:'expense', account:'Alex'  },
  { date:'2026-03-24', description:'Tesco',                            category:'Groceries',        amount:-17.96,  type:'expense', account:'Alex'  },
  { date:'2026-03-27', description:'Alex salary',                      category:'Income',           amount:3829.31, type:'income',  account:'Alex'  },
  { date:'2026-03-27', description:"Sainsbury's savings card",         category:'Groceries',        amount:-95.50,  type:'expense', account:'Alex'  },
  { date:'2026-03-27', description:'HSBC bank fee',                    category:'Bills & Utilities',amount:-11.95,  type:'expense', account:'Alex'  },
  { date:'2026-03-28', description:'Namak take away',                  category:'Dining Out',       amount:-55.24,  type:'expense', account:'Alex'  },
  { date:'2026-03-28', description:'M&S',                              category:'Groceries',        amount:-18.90,  type:'expense', account:'Alex'  },
  { date:'2026-03-28', description:'Tesco',                            category:'Groceries',        amount:-8.10,   type:'expense', account:'Alex'  },
  { date:'2026-03-28', description:'Alex tube',                        category:'Transport',        amount:-7.20,   type:'expense', account:'Alex'  },
  { date:'2026-03-29', description:'Alex pub',                         category:'Dining Out',       amount:-7.90,   type:'expense', account:'Alex'  },
  { date:'2026-03-29', description:'Alex tube',                        category:'Transport',        amount:-7.20,   type:'expense', account:'Alex'  },
  { date:'2026-03-30', description:'House rent',                       category:'Bills & Utilities',amount:-500.00, type:'expense', account:'Alex'  },
  { date:'2026-03-30', description:'COSTCO',                           category:'Groceries',        amount:-114.71, type:'expense', account:'Alex'  },
  { date:'2026-03-30', description:'Wines with Rob',                   category:'Dining Out',       amount:-29.90,  type:'expense', account:'Alex'  },
  { date:'2026-03-30', description:'Wines with Rob',                   category:'Dining Out',       amount:-29.90,  type:'expense', account:'Alex'  },
  { date:'2026-03-30', description:'Alex pub with Rob',                category:'Dining Out',       amount:-5.55,   type:'expense', account:'Alex'  },
  { date:'2026-03-30', description:'Alex pub with Rob',                category:'Dining Out',       amount:-9.65,   type:'expense', account:'Alex'  },
  { date:'2026-03-30', description:'Alex pub with Rob',                category:'Dining Out',       amount:-12.65,  type:'expense', account:'Alex'  },
  { date:'2026-03-30', description:'Alex lunch with Groovy',           category:'Dining Out',       amount:-37.57,  type:'expense', account:'Alex'  },
  { date:'2026-03-30', description:'Alex hair cut',                    category:'Shopping',         amount:-25.00,  type:'expense', account:'Alex'  },
  { date:'2026-03-31', description:"Sainsbury's",                      category:'Groceries',        amount:-4.05,   type:'expense', account:'Alex'  },
];

const JAN_2026 = [
  { date:'2026-01-02', description:'Service design book for work',     category:'Shopping',         amount:-19.18,   type:'expense', account:'Alex'  },
  { date:'2026-01-02', description:'Lloyds bank interest',             category:'Income',           amount:2.19,     type:'income',  account:'Kelly' },
  { date:'2026-01-02', description:'Vacuum replacement part',          category:'Home & Garden',    amount:-27.00,   type:'expense', account:'Alex'  },
  { date:'2026-01-02', description:'International supermarket',        category:'Groceries',        amount:-4.77,    type:'expense', account:'Alex'  },
  { date:'2026-01-02', description:'Refund Amex Marriott membership',  category:'Income',           amount:74.43,    type:'income',  account:'Alex'  },
  { date:'2026-01-02', description:'Car tax',                          category:'Car',              amount:-26.68,   type:'expense', account:'Alex'  },
  { date:'2026-01-02', description:'Modeling knife',                   category:'Entertainment',    amount:-5.99,    type:'expense', account:'Alex'  },
  { date:'2026-01-03', description:'Costco - meat and water',          category:'Groceries',        amount:-106.80,  type:'expense', account:'Alex'  },
  { date:'2026-01-04', description:'Hot pot lunch',                    category:'Dining Out',       amount:-126.75,  type:'expense', account:'Alex'  },
  { date:'2026-01-04', description:'Alex tube',                        category:'Transport',        amount:-6.80,    type:'expense', account:'Alex'  },
  { date:'2026-01-04', description:'Alex books',                       category:'Shopping',         amount:-21.98,   type:'expense', account:'Alex'  },
  { date:'2026-01-04', description:'Alex popcorns',                    category:'Dining Out',       amount:-11.49,   type:'expense', account:'Alex'  },
  { date:'2026-01-04', description:'Kelly tube',                       category:'Transport',        amount:-6.80,    type:'expense', account:'Kelly' },
  { date:'2026-01-04', description:'Kelly Oseyo',                      category:'Groceries',        amount:-2.75,    type:'expense', account:'Kelly' },
  { date:'2026-01-05', description:'Cinema tickets',                   category:'Entertainment',    amount:-14.00,   type:'expense', account:'Kelly' },
  { date:'2026-01-05', description:'Kelly shopping - charity shop',    category:'Shopping',         amount:-5.00,    type:'expense', account:'Kelly' },
  { date:'2026-01-06', description:'Alex Audible',                     category:'Entertainment',    amount:-0.99,    type:'expense', account:'Alex'  },
  { date:'2026-01-06', description:'Refund from Ryanair insurance',    category:'Income',           amount:213.52,   type:'income',  account:'Kelly' },
  { date:'2026-01-07', description:'Radiator bleed key',               category:'Home & Garden',    amount:-3.99,    type:'expense', account:'Alex'  },
  { date:'2026-01-07', description:'Earphones',                        category:'Shopping',         amount:-1.99,    type:'expense', account:'Alex'  },
  { date:'2026-01-07', description:'Alex History podcast',             category:'Entertainment',    amount:-6.00,    type:'expense', account:'Alex'  },
  { date:'2026-01-07', description:'Hanging strips',                   category:'Home & Garden',    amount:-8.00,    type:'expense', account:'Alex'  },
  { date:'2026-01-08', description:'Tesco',                            category:'Groceries',        amount:-2.16,    type:'expense', account:'Alex'  },
  { date:'2026-01-09', description:'Traps for a car',                  category:'Car',              amount:-5.38,    type:'expense', account:'Alex'  },
  { date:'2026-01-09', description:'Alex music stuff',                 category:'Entertainment',    amount:-41.95,   type:'expense', account:'Alex'  },
  { date:'2026-01-09', description:'Alex music stuff',                 category:'Entertainment',    amount:-11.99,   type:'expense', account:'Alex'  },
  { date:'2026-01-10', description:'Sharps pen',                       category:'Shopping',         amount:-3.13,    type:'expense', account:'Alex'  },
  { date:'2026-01-10', description:"Sainsbury's savings card",         category:'Groceries',        amount:-95.50,   type:'expense', account:'Kelly' },
  { date:'2026-01-11', description:'Torch for cooking',                category:'Home & Garden',    amount:-11.99,   type:'expense', account:'Alex'  },
  { date:'2026-01-11', description:'Logs and coal and wood',           category:'Home & Garden',    amount:-31.46,   type:'expense', account:'Alex'  },
  { date:'2026-01-11', description:'Kelly tube to book club',          category:'Transport',        amount:-6.80,    type:'expense', account:'Kelly' },
  { date:'2026-01-11', description:'Coffee',                           category:'Dining Out',       amount:-3.45,    type:'expense', account:'Kelly' },
  { date:'2026-01-12', description:'Train tickets for York trip',      category:'Holiday & Travel', amount:-94.79,   type:'expense', account:'Alex'  },
  { date:'2026-01-12', description:'A hotel for York trip',            category:'Holiday & Travel', amount:-206.96,  type:'expense', account:'Alex'  },
  { date:'2026-01-13', description:'Costco',                           category:'Groceries',        amount:-44.55,   type:'expense', account:'Alex'  },
  { date:'2026-01-13', description:'Kelly coffee',                     category:'Dining Out',       amount:-4.45,    type:'expense', account:'Kelly' },
  { date:'2026-01-13', description:'Kelly tube',                       category:'Transport',        amount:-10.80,   type:'expense', account:'Kelly' },
  { date:'2026-01-14', description:'Kelly flights to Tenerife',        category:'Holiday & Travel', amount:-84.13,   type:'expense', account:'Kelly' },
  { date:'2026-01-14', description:'Zara clothing',                    category:'Shopping',         amount:-31.80,   type:'expense', account:'Kelly' },
  { date:'2026-01-14', description:'Kelly tube',                       category:'Transport',        amount:-8.00,    type:'expense', account:'Kelly' },
  { date:'2026-01-16', description:'Internet broadband',               category:'Bills & Utilities',amount:-36.54,   type:'expense', account:'Alex'  },
  { date:'2026-01-16', description:'Alex & Kelly flights to Korea',    category:'Holiday & Travel', amount:-1278.65, type:'expense', account:'Alex'  },
  { date:'2026-01-16', description:'KJ apple storage',                 category:'Subscriptions',    amount:-2.99,    type:'expense', account:'Kelly' },
  { date:'2026-01-17', description:'Kelly tube',                       category:'Transport',        amount:-5.90,    type:'expense', account:'Kelly' },
  { date:'2026-01-17', description:'Alex Floy models membership',      category:'Entertainment',    amount:-4.80,    type:'expense', account:'Alex'  },
  { date:'2026-01-18', description:'Lidl',                             category:'Groceries',        amount:-33.34,   type:'expense', account:'Alex'  },
  { date:'2026-01-19', description:'Booked a hotel in Seoul',          category:'Holiday & Travel', amount:-40.54,   type:'expense', account:'Alex'  },
  { date:'2026-01-19', description:'Alex phone bill',                  category:'Subscriptions',    amount:-5.00,    type:'expense', account:'Alex'  },
  { date:'2026-01-19', description:'Booked a hotel in Incheon',        category:'Holiday & Travel', amount:-78.71,   type:'expense', account:'Alex'  },
  { date:'2026-01-19', description:'Alex music battery',               category:'Entertainment',    amount:-9.00,    type:'expense', account:'Alex'  },
  { date:'2026-01-19', description:'Alex lottery',                     category:'Entertainment',    amount:-20.00,   type:'expense', account:'Alex'  },
  { date:'2026-01-20', description:'Car insurance - 1 year',           category:'Car',              amount:-465.86,  type:'expense', account:'Alex'  },
  { date:'2026-01-20', description:'Tesco',                            category:'Groceries',        amount:-1.52,    type:'expense', account:'Alex'  },
  { date:'2026-01-20', description:'Booked a flight from Japan',       category:'Holiday & Travel', amount:-60.74,   type:'expense', account:'Alex'  },
  { date:'2026-01-21', description:'Tesco',                            category:'Groceries',        amount:-6.46,    type:'expense', account:'Alex'  },
  { date:'2026-01-22', description:'Kelly tube',                       category:'Transport',        amount:-11.80,   type:'expense', account:'Kelly' },
  { date:'2026-01-23', description:'Hotel in Kyoto',                   category:'Holiday & Travel', amount:-59.21,   type:'expense', account:'Alex'  },
  { date:'2026-01-23', description:'Flight from Sapporo to Osaka',     category:'Holiday & Travel', amount:-101.60,  type:'expense', account:'Alex'  },
  { date:'2026-01-23', description:'Tesco',                            category:'Groceries',        amount:-12.45,   type:'expense', account:'Alex'  },
  { date:'2026-01-23', description:'Bed payment installment',          category:'Home & Garden',    amount:-75.70,   type:'expense', account:'Alex'  },
  { date:'2026-01-24', description:'Retainer brite',                   category:'Health & Medical', amount:-13.20,   type:'expense', account:'Alex'  },
  { date:'2026-01-24', description:'Lunch',                            category:'Dining Out',       amount:-19.90,   type:'expense', account:'Alex'  },
  { date:'2026-01-24', description:"Sainsbury's savings card",         category:'Groceries',        amount:-47.75,   type:'expense', account:'Kelly' },
  { date:'2026-01-24', description:'Kelly accessory',                  category:'Shopping',         amount:-4.00,    type:'expense', account:'Kelly' },
  { date:'2026-01-25', description:'Glues for modeling',               category:'Entertainment',    amount:-25.00,   type:'expense', account:'Alex'  },
  { date:'2026-01-26', description:'Airbrush holder',                  category:'Entertainment',    amount:-8.59,    type:'expense', account:'Alex'  },
  { date:'2026-01-26', description:'Tesco',                            category:'Groceries',        amount:-3.24,    type:'expense', account:'Alex'  },
  { date:'2026-01-27', description:"Sainsbury's",                      category:'Groceries',        amount:-9.25,    type:'expense', account:'Alex'  },
  { date:'2026-01-27', description:'HSBC bank fee',                    category:'Bills & Utilities',amount:-11.95,   type:'expense', account:'Alex'  },
  { date:'2026-01-28', description:'Alex salary',                      category:'Income',           amount:3829.72,  type:'income',  account:'Alex'  },
  { date:'2026-01-28', description:'House rent',                       category:'Bills & Utilities',amount:-500.00,  type:'expense', account:'Alex'  },
  { date:'2026-01-29', description:'Wire cutters',                     category:'Entertainment',    amount:-4.98,    type:'expense', account:'Alex'  },
  { date:'2026-01-29', description:'A mixer',                          category:'Home & Garden',    amount:-50.00,   type:'expense', account:'Alex'  },
  { date:'2026-01-29', description:"Sainsbury's",                      category:'Groceries',        amount:-2.50,    type:'expense', account:'Kelly' },
  { date:'2026-01-30', description:'Cutting mat',                      category:'Entertainment',    amount:-3.75,    type:'expense', account:'Alex'  },
  { date:'2026-01-31', description:'Cotton buds for modeling',         category:'Entertainment',    amount:-4.99,    type:'expense', account:'Alex'  },
  { date:'2026-01-31', description:'Tesco',                            category:'Groceries',        amount:-8.95,    type:'expense', account:'Alex'  },
  { date:'2026-01-31', description:'Kelly cosmetics sale cash',        category:'Income',           amount:300.00,   type:'income',  account:'Kelly' },
  { date:'2026-01-31', description:'Kelly train to New Malden',        category:'Transport',        amount:-10.50,   type:'expense', account:'Kelly' },
  { date:'2026-01-31', description:'Kelly coffee',                     category:'Dining Out',       amount:-3.90,    type:'expense', account:'Kelly' },
];

const FEB_2026 = [
  { date:'2026-02-01', description:'Booked a hotel in Osaka',          category:'Holiday & Travel', amount:-112.68,  type:'expense', account:'Alex'  },
  { date:'2026-02-01', description:'Petrol',                           category:'Car',              amount:-10.34,   type:'expense', account:'Alex'  },
  { date:'2026-02-01', description:"Kelly pizza at Alex's gig",        category:'Dining Out',       amount:-10.00,   type:'expense', account:'Kelly' },
  { date:'2026-02-02', description:'Tesco',                            category:'Groceries',        amount:-8.30,    type:'expense', account:'Alex'  },
  { date:'2026-02-02', description:'Sharps pen',                       category:'Shopping',         amount:-4.55,    type:'expense', account:'Alex'  },
  { date:'2026-02-02', description:'Drinks at pub',                    category:'Dining Out',       amount:-8.60,    type:'expense', account:'Alex'  },
  { date:'2026-02-03', description:"Sainsbury's savings card",         category:'Groceries',        amount:-95.50,   type:'expense', account:'Alex'  },
  { date:'2026-02-03', description:'Costco',                           category:'Groceries',        amount:-71.45,   type:'expense', account:'Alex'  },
  { date:'2026-02-03', description:'Maltalk',                          category:'Subscriptions',    amount:-0.99,    type:'expense', account:'Kelly' },
  { date:'2026-02-04', description:'Kelly tube',                       category:'Transport',        amount:-8.00,   type:'expense', account:'Kelly' },
  { date:'2026-02-04', description:'Alex comedy theatre with Rob',     category:'Entertainment',    amount:-30.00,  type:'expense', account:'Alex'  },
  { date:'2026-02-04', description:'Holiday in York tickets',          category:'Holiday & Travel', amount:-35.00,  type:'expense', account:'Alex'  },
  { date:'2026-02-05', description:'Train show ticket',                category:'Entertainment',    amount:-25.50,  type:'expense', account:'Alex'  },
  { date:'2026-02-05', description:'Netflix subscription',             category:'Subscriptions',    amount:-5.99,   type:'expense', account:'Alex'  },
  { date:'2026-02-06', description:'Alex music paddle',                category:'Entertainment',    amount:-20.00,  type:'expense', account:'Alex'  },
  { date:'2026-02-06', description:'Alex music paddle',                category:'Entertainment',    amount:-110.00, type:'expense', account:'Alex'  },
  { date:'2026-02-06', description:'Travel',                           category:'Transport',        amount:-0.10,   type:'expense', account:'Alex'  },
  { date:'2026-02-06', description:'Holiday in York lunch',            category:'Dining Out',       amount:-59.26,  type:'expense', account:'Alex'  },
  { date:'2026-02-06', description:'Holiday in York Alex book',        category:'Shopping',         amount:-5.99,   type:'expense', account:'Alex'  },
  { date:'2026-02-06', description:'Holiday in York tea and cake',     category:'Dining Out',       amount:-10.70,  type:'expense', account:'Alex'  },
  { date:'2026-02-07', description:'Holiday in York shopping',         category:'Shopping',         amount:-11.68,  type:'expense', account:'Kelly' },
  { date:'2026-02-07', description:'Holiday in York dinner',           category:'Dining Out',       amount:-70.17,  type:'expense', account:'Alex'  },
  { date:'2026-02-07', description:'Holiday in York books',            category:'Shopping',         amount:-37.99,  type:'expense', account:'Alex'  },
  { date:'2026-02-07', description:'Holiday in York water',            category:'Dining Out',       amount:-3.20,   type:'expense', account:'Alex'  },
  { date:'2026-02-07', description:'Holiday in York coffee',           category:'Dining Out',       amount:-5.80,   type:'expense', account:'Alex'  },
  { date:'2026-02-07', description:'Cat stuff for mum',                category:'Shopping',         amount:-9.00,   type:'expense', account:'Alex'  },
  { date:'2026-02-07', description:'Holiday in York lunch',            category:'Dining Out',       amount:-10.50,  type:'expense', account:'Alex'  },
  { date:'2026-02-07', description:'Alex podcast subscription',        category:'Entertainment',    amount:-6.00,   type:'expense', account:'Alex'  },
  { date:'2026-02-07', description:'Holiday in York lunch',            category:'Dining Out',       amount:-17.50,  type:'expense', account:'Alex'  },
  { date:'2026-02-07', description:'Holiday in York tickets',          category:'Holiday & Travel', amount:-36.00,  type:'expense', account:'Alex'  },
  { date:'2026-02-07', description:'Alex Audible',                     category:'Entertainment',    amount:-8.99,   type:'expense', account:'Alex'  },
  { date:'2026-02-08', description:'Holiday in York dinner',           category:'Dining Out',       amount:-84.70,  type:'expense', account:'Alex'  },
  { date:'2026-02-08', description:'Holiday in York tea and cake',     category:'Dining Out',       amount:-21.99,  type:'expense', account:'Alex'  },
  { date:'2026-02-08', description:'Holiday in York book',             category:'Shopping',         amount:-8.99,   type:'expense', account:'Alex'  },
  { date:'2026-02-09', description:'Holiday in York shirt',            category:'Shopping',         amount:-10.00,  type:'expense', account:'Alex'  },
  { date:'2026-02-09', description:'Cutting mat',                      category:'Entertainment',    amount:-2.49,   type:'expense', account:'Alex'  },
  { date:'2026-02-09', description:'Holiday in York tickets',          category:'Holiday & Travel', amount:-20.00,  type:'expense', account:'Alex'  },
  { date:'2026-02-09', description:'Water',                            category:'Dining Out',       amount:-1.05,   type:'expense', account:'Alex'  },
  { date:'2026-02-09', description:'Gifts',                            category:'Shopping',         amount:-75.00,  type:'expense', account:'Alex'  },
  { date:'2026-02-09', description:'Holiday in York dinner',           category:'Dining Out',       amount:-45.11,  type:'expense', account:'Alex'  },
  { date:'2026-02-09', description:'Holiday in York lunch',            category:'Dining Out',       amount:-21.84,  type:'expense', account:'Alex'  },
  { date:'2026-02-09', description:'Alex tube',                        category:'Transport',        amount:-3.10,   type:'expense', account:'Alex'  },
  { date:'2026-02-09', description:'Holiday in York books',            category:'Shopping',         amount:-8.99,   type:'expense', account:'Alex'  },
  { date:'2026-02-09', description:'Holiday in York book',             category:'Shopping',         amount:-5.99,   type:'expense', account:'Alex'  },
  { date:'2026-02-09', description:'Holiday in York tea and cake',     category:'Dining Out',       amount:-10.70,  type:'expense', account:'Alex'  },
  { date:'2026-02-09', description:'Holiday in York tickets',          category:'Holiday & Travel', amount:-17.00,  type:'expense', account:'Kelly' },
  { date:'2026-02-09', description:'Holiday in York book',             category:'Shopping',         amount:-14.98,  type:'expense', account:'Kelly' },
  { date:'2026-02-09', description:'Holiday in York cards',            category:'Shopping',         amount:-5.00,   type:'expense', account:'Kelly' },
  { date:'2026-02-09', description:'Holiday in York bakery',           category:'Dining Out',       amount:-5.70,   type:'expense', account:'Kelly' },
  { date:'2026-02-09', description:'Holiday in York coffee',           category:'Dining Out',       amount:-3.80,   type:'expense', account:'Kelly' },
  { date:'2026-02-10', description:'Music power adaptor cables',       category:'Entertainment',    amount:-7.98,   type:'expense', account:'Alex'  },
  { date:'2026-02-10', description:'Music patch leads',                category:'Entertainment',    amount:-12.99,  type:'expense', account:'Alex'  },
  { date:'2026-02-11', description:'Alex music stuff',                 category:'Entertainment',    amount:-11.47,  type:'expense', account:'Alex'  },
  { date:'2026-02-12', description:'Alex music stuff',                 category:'Entertainment',    amount:-8.99,   type:'expense', account:'Alex'  },
  { date:'2026-02-12', description:'Tesco',                            category:'Groceries',        amount:-9.66,   type:'expense', account:'Alex'  },
  { date:'2026-02-12', description:'Kelly Libera phone bill',          category:'Subscriptions',    amount:-2.50,   type:'expense', account:'Kelly' },
  { date:'2026-02-13', description:'Alex music stuff paddles',         category:'Entertainment',    amount:-52.98,  type:'expense', account:'Alex'  },
  { date:'2026-02-14', description:'Billingsgate fish',                category:'Groceries',        amount:-35.00,  type:'expense', account:'Kelly' },
  { date:'2026-02-14', description:'Waitrose',                         category:'Groceries',        amount:-11.70,  type:'expense', account:'Alex'  },
  { date:'2026-02-14', description:'Billingsgate fish',                category:'Groceries',        amount:-33.00,  type:'expense', account:'Alex'  },
  { date:'2026-02-14', description:'Billingsgate fish',                category:'Groceries',        amount:-70.00,  type:'expense', account:'Alex'  },
  { date:'2026-02-14', description:'Parking',                          category:'Transport',        amount:-3.00,   type:'expense', account:'Alex'  },
  { date:'2026-02-14', description:'Pastry',                           category:'Dining Out',       amount:-6.63,   type:'expense', account:'Kelly' },
  { date:'2026-02-15', description:'Kelly tube',                       category:'Transport',        amount:-3.10,   type:'expense', account:'Kelly' },
  { date:'2026-02-16', description:'Costco',                           category:'Groceries',        amount:-18.27,  type:'expense', account:'Alex'  },
  { date:'2026-02-16', description:'Tesco',                            category:'Groceries',        amount:-1.30,   type:'expense', account:'Alex'  },
  { date:'2026-02-16', description:'KJ apple storage',                 category:'Subscriptions',    amount:-2.99,   type:'expense', account:'Kelly' },
  { date:'2026-02-16', description:'Costco & Tesco homeware',          category:'Home & Garden',    amount:-19.57,  type:'expense', account:'Alex'  },
  { date:'2026-02-16', description:'International supermarket',        category:'Groceries',        amount:-4.44,   type:'expense', account:'Kelly' },
  { date:'2026-02-16', description:"Sainsbury's savings card",         category:'Groceries',        amount:-47.75,  type:'expense', account:'Kelly' },
  { date:'2026-02-16', description:'Alex Floy models membership',      category:'Entertainment',    amount:-4.80,   type:'expense', account:'Alex'  },
  { date:'2026-02-16', description:'Internet broadband',               category:'Bills & Utilities',amount:-36.54,  type:'expense', account:'Alex'  },
  { date:'2026-02-16', description:'Car tax yearly',                   category:'Car',              amount:-315.00, type:'expense', account:'Alex'  },
  { date:'2026-02-17', description:'Coal and woods',                   category:'Home & Garden',    amount:-23.47,  type:'expense', account:'Alex'  },
  { date:'2026-02-18', description:'Lebara phone plan',                category:'Subscriptions',    amount:-5.00,   type:'expense', account:'Alex'  },
  { date:'2026-02-18', description:'Kelly tube',                       category:'Transport',        amount:-6.80,   type:'expense', account:'Kelly' },
  { date:'2026-02-18', description:'Kelly dinner out',                 category:'Dining Out',       amount:-21.15,  type:'expense', account:'Kelly' },
  { date:'2026-02-18', description:'Kelly coffee',                     category:'Dining Out',       amount:-4.50,   type:'expense', account:'Kelly' },
  { date:'2026-02-19', description:'A book for work',                  category:'Shopping',         amount:-11.88,  type:'expense', account:'Alex'  },
  { date:'2026-02-19', description:'London transport museum',          category:'Entertainment',    amount:-19.00,  type:'expense', account:'Alex'  },
  { date:'2026-02-20', description:'Kelly tube',                       category:'Transport',        amount:-8.00,   type:'expense', account:'Kelly' },
  { date:'2026-02-20', description:'Booked holiday for Riga',          category:'Holiday & Travel', amount:-330.00, type:'expense', account:'Alex'  },
  { date:'2026-02-20', description:'Volume control',                   category:'Entertainment',    amount:-28.69,  type:'expense', account:'Alex'  },
  { date:'2026-02-20', description:'Tesco',                            category:'Groceries',        amount:-8.51,   type:'expense', account:'Alex'  },
  { date:'2026-02-20', description:'British museum',                   category:'Entertainment',    amount:-25.00,  type:'expense', account:'Alex'  },
  { date:'2026-02-20', description:'Kelly tea',                        category:'Dining Out',       amount:-3.35,   type:'expense', account:'Kelly' },
  { date:'2026-02-21', description:'M&S',                              category:'Groceries',        amount:-3.50,   type:'expense', account:'Alex'  },
  { date:'2026-02-22', description:"Alex's gig money",                 category:'Income',           amount:100.00,  type:'income',  account:'Alex'  },
  { date:'2026-02-22', description:'Kelly tube',                       category:'Transport',        amount:-14.90,  type:'expense', account:'Kelly' },
  { date:'2026-02-22', description:'Kelly Oseyo',                      category:'Groceries',        amount:-3.99,   type:'expense', account:'Kelly' },
  { date:'2026-02-22', description:'Kelly lunch and dinner out',       category:'Dining Out',       amount:-39.74,  type:'expense', account:'Kelly' },
  { date:'2026-02-23', description:'Plug socket',                      category:'Home & Garden',    amount:-6.99,   type:'expense', account:'Alex'  },
  { date:'2026-02-23', description:'Cable management',                 category:'Entertainment',    amount:-4.99,   type:'expense', account:'Alex'  },
  { date:'2026-02-23', description:'Claude subscription',              category:'Subscriptions',    amount:-17.21,  type:'expense', account:'Alex'  },
  { date:'2026-02-23', description:'Tesco',                            category:'Groceries',        amount:-12.78,  type:'expense', account:'Alex'  },
  { date:'2026-02-23', description:'Bed payment installment',          category:'Home & Garden',    amount:-75.70,  type:'expense', account:'Alex'  },
  { date:'2026-02-24', description:'Post its',                         category:'Shopping',         amount:-3.99,   type:'expense', account:'Alex'  },
  { date:'2026-02-25', description:'Alex music stuff',                 category:'Entertainment',    amount:-16.04,  type:'expense', account:'Alex'  },
  { date:'2026-02-25', description:'Coolant',                          category:'Car',              amount:-11.74,  type:'expense', account:'Alex'  },
  { date:'2026-02-25', description:'Kelly dinner out',                 category:'Dining Out',       amount:-25.00,  type:'expense', account:'Kelly' },
  { date:'2026-02-25', description:'Kelly tube',                       category:'Transport',        amount:-6.80,   type:'expense', account:'Kelly' },
  { date:'2026-02-26', description:'Kelly roaming fee',                category:'Holiday & Travel', amount:-5.00,   type:'expense', account:'Kelly' },
  { date:'2026-02-26', description:'Tesco',                            category:'Groceries',        amount:-3.70,   type:'expense', account:'Kelly' },
  { date:'2026-02-27', description:'Alex salary',                      category:'Income',           amount:3829.31, type:'income',  account:'Alex'  },
  { date:'2026-02-27', description:"Sainsbury's",                      category:'Groceries',        amount:-21.07,  type:'expense', account:'Alex'  },
  { date:'2026-02-27', description:'Amp repair',                       category:'Entertainment',    amount:-60.00,  type:'expense', account:'Alex'  },
  { date:'2026-02-27', description:'House rent',                       category:'Bills & Utilities',amount:-500.00, type:'expense', account:'Alex'  },
  { date:'2026-02-27', description:'HSBC bank fee',                    category:'Bills & Utilities',amount:-11.95,  type:'expense', account:'Alex'  },
  { date:'2026-02-27', description:'Kelly Tenerife airport lunch',     category:'Holiday & Travel', amount:-10.90,  type:'expense', account:'Kelly' },
  { date:'2026-02-28', description:'Tesco',                            category:'Groceries',        amount:-3.47,   type:'expense', account:'Alex'  },
  { date:'2026-02-28', description:'Stansted parking',                 category:'Transport',        amount:-7.00,   type:'expense', account:'Alex'  },
];

const SEP_2025 = [
  { date:'2025-09-01', description:'Gift for mum',                     category:'Gifts',            amount:-16.99,  type:'expense', account:'Alex'  },
  { date:'2025-09-01', description:'Fish and chips',                   category:'Dining Out',       amount:-13.00,  type:'expense', account:'Alex'  },
  { date:'2025-09-01', description:'Car tax',                          category:'Car',              amount:-26.78,  type:'expense', account:'Alex'  },
  { date:'2025-09-01', description:'Car insurance',                    category:'Car',              amount:-53.75,  type:'expense', account:'Alex'  },
  { date:'2025-09-02', description:'Airport drop off',                 category:'Transport',        amount:-7.00,   type:'expense', account:'Alex'  },
  { date:'2025-09-02', description:'Alex pub',                         category:'Dining Out',       amount:-19.78,  type:'expense', account:'Alex'  },
  { date:'2025-09-02', description:'Alex lunch at work',               category:'Dining Out',       amount:-9.55,   type:'expense', account:'Alex'  },
  { date:'2025-09-02', description:'Taxi',                             category:'Transport',        amount:-7.50,   type:'expense', account:'Alex'  },
  { date:'2025-09-02', description:'Alex tube',                        category:'Transport',        amount:-8.00,   type:'expense', account:'Alex'  },
  { date:'2025-09-02', description:'Kelly tube',                       category:'Transport',        amount:-6.80,   type:'expense', account:'Kelly' },
  { date:'2025-09-03', description:"Sainsbury's",                      category:'Groceries',        amount:-5.60,   type:'expense', account:'Alex'  },
  { date:'2025-09-03', description:'Dandan noodles',                   category:'Dining Out',       amount:-52.30,  type:'expense', account:'Alex'  },
  { date:'2025-09-04', description:'Sold skincare',                    category:'Other',            amount:40.00,   type:'income',  account:'Kelly' },
  { date:'2025-09-05', description:'Alex book',                        category:'Entertainment',    amount:-8.73,   type:'expense', account:'Alex'  },
  { date:'2025-09-05', description:'Alex audible',                     category:'Entertainment',    amount:-8.99,   type:'expense', account:'Alex'  },
  { date:'2025-09-05', description:'Tesco',                            category:'Groceries',        amount:-16.00,  type:'expense', account:'Alex'  },
  { date:'2025-09-05', description:'Bday gift',                        category:'Gifts',            amount:-98.00,  type:'expense', account:'Kelly' },
  { date:'2025-09-06', description:'Pub',                              category:'Dining Out',       amount:-11.30,  type:'expense', account:'Alex'  },
  { date:'2025-09-06', description:'Camino Farringdon',                category:'Dining Out',       amount:-58.80,  type:'expense', account:'Alex'  },
  { date:'2025-09-06', description:'St. Johns',                        category:'Dining Out',       amount:-182.48, type:'expense', account:'Alex'  },
  { date:'2025-09-06', description:'Tesco',                            category:'Groceries',        amount:-5.45,   type:'expense', account:'Alex'  },
  { date:'2025-09-06', description:'Alex tube',                        category:'Transport',        amount:-10.30,  type:'expense', account:'Alex'  },
  { date:'2025-09-06', description:'Alex uber trip',                   category:'Transport',        amount:-12.91,  type:'expense', account:'Alex'  },
  { date:'2025-09-06', description:'Kelly tube',                       category:'Transport',        amount:-10.30,  type:'expense', account:'Kelly' },
  { date:'2025-09-07', description:'Alex podcast subscription',        category:'Subscriptions',    amount:-6.00,   type:'expense', account:'Alex'  },
  { date:'2025-09-07', description:'Costco',                           category:'Groceries',        amount:-50.70,  type:'expense', account:'Alex'  },
  { date:'2025-09-07', description:'Uber tip',                         category:'Transport',        amount:-2.00,   type:'expense', account:'Alex'  },
  { date:'2025-09-07', description:"Savings card - Sainsbury's",       category:'Groceries',        amount:-95.50,  type:'expense', account:'Kelly' },
  { date:'2025-09-08', description:'Books',                            category:'Entertainment',    amount:-21.99,  type:'expense', account:'Alex'  },
  { date:'2025-09-08', description:'Screw heads',                      category:'Home & Garden',    amount:-16.95,  type:'expense', account:'Alex'  },
  { date:'2025-09-08', description:'Chinese takeaway',                 category:'Dining Out',       amount:-25.80,  type:'expense', account:'Alex'  },
  { date:'2025-09-08', description:'Tube to Heathrow Airport',         category:'Transport',        amount:-13.90,  type:'expense', account:'Kelly' },
  { date:'2025-09-08', description:'Wine & chocolate as a gift',       category:'Holiday & Travel', amount:-21.97,  type:'expense', account:'Kelly' },
  { date:'2025-09-10', description:'Hair remove roller',               category:'Home & Garden',    amount:-8.71,   type:'expense', account:'Alex'  },
  { date:'2025-09-10', description:'Driveway cleaner',                 category:'Home & Garden',    amount:-17.99,  type:'expense', account:'Alex'  },
  { date:'2025-09-12', description:'Tesco',                            category:'Groceries',        amount:-31.71,  type:'expense', account:'Alex'  },
  { date:'2025-09-14', description:'Alex YouTube',                     category:'Subscriptions',    amount:-4.99,   type:'expense', account:'Alex'  },
  { date:'2025-09-14', description:'Tesco',                            category:'Groceries',        amount:-10.07,  type:'expense', account:'Alex'  },
  { date:'2025-09-15', description:'Micro towels for a car',           category:'Car',              amount:-12.99,  type:'expense', account:'Alex'  },
  { date:'2025-09-15', description:'Heathrow parking',                 category:'Transport',        amount:-6.00,   type:'expense', account:'Alex'  },
  { date:'2025-09-15', description:'Stansted parking',                 category:'Transport',        amount:-7.00,   type:'expense', account:'Alex'  },
  { date:'2025-09-15', description:'Alex music',                       category:'Entertainment',    amount:-2.04,   type:'expense', account:'Alex'  },
  { date:'2025-09-15', description:'Tesco',                            category:'Groceries',        amount:-4.55,   type:'expense', account:'Alex'  },
  { date:'2025-09-15', description:'Alex film podcast',                category:'Entertainment',    amount:-3.49,   type:'expense', account:'Alex'  },
  { date:'2025-09-16', description:'Alex audible',                     category:'Entertainment',    amount:-11.96,  type:'expense', account:'Alex'  },
  { date:'2025-09-16', description:'Alex music - Spotify',             category:'Subscriptions',    amount:-11.99,  type:'expense', account:'Alex'  },
  { date:'2025-09-16', description:'Internet broadband',               category:'Bills & Utilities',amount:-36.54,  type:'expense', account:'Alex'  },
  { date:'2025-09-16', description:"Savings card - Sainsbury's",       category:'Groceries',        amount:-95.50,  type:'expense', account:'Kelly' },
  { date:'2025-09-16', description:'KJ Apple storage',                 category:'Subscriptions',    amount:-2.99,   type:'expense', account:'Kelly' },
  { date:'2025-09-17', description:'Alex Floy models membership',      category:'Entertainment',    amount:-4.80,   type:'expense', account:'Alex'  },
  { date:'2025-09-18', description:"Sainsbury's",                      category:'Groceries',        amount:-7.87,   type:'expense', account:'Alex'  },
  { date:'2025-09-18', description:'Kelly takeaway',                   category:'Dining Out',       amount:-18.10,  type:'expense', account:'Kelly' },
  { date:'2025-09-18', description:'Kelly wine',                       category:'Groceries',        amount:-7.75,   type:'expense', account:'Kelly' },
  { date:'2025-09-19', description:'Stansted parking',                 category:'Transport',        amount:-7.00,   type:'expense', account:'Alex'  },
  { date:'2025-09-20', description:'International supermarket',        category:'Groceries',        amount:-4.00,   type:'expense', account:'Alex'  },
  { date:'2025-09-21', description:'Kelly tube',                       category:'Transport',        amount:-6.80,   type:'expense', account:'Kelly' },
  { date:'2025-09-21', description:'Tesco',                            category:'Groceries',        amount:-5.30,   type:'expense', account:'Kelly' },
  { date:'2025-09-21', description:'Alex phone bill',                  category:'Bills & Utilities',amount:-5.00,   type:'expense', account:'Alex'  },
  { date:'2025-09-22', description:'Alex holiday with a friend',       category:'Holiday & Travel', amount:-330.40, type:'expense', account:'Alex'  },
  { date:'2025-09-22', description:"Alex's holiday expenses",          category:'Holiday & Travel', amount:-149.70, type:'expense', account:'Alex'  },
  { date:'2025-09-22', description:"Kelly's clothing",                 category:'Shopping',         amount:-27.80,  type:'expense', account:'Alex'  },
  { date:'2025-09-23', description:'Kelly CapCut subscription',        category:'Subscriptions',    amount:-21.99,  type:'expense', account:'Kelly' },
  { date:'2025-09-23', description:'Bed payment installment',          category:'Home & Garden',    amount:-75.70,  type:'expense', account:'Alex'  },
  { date:'2025-09-24', description:'Kelly out with friends',           category:'Dining Out',       amount:-31.42,  type:'expense', account:'Kelly' },
  { date:'2025-09-24', description:'Kelly tube',                       category:'Transport',        amount:-8.00,   type:'expense', account:'Kelly' },
  { date:'2025-09-24', description:'Alex audible',                     category:'Entertainment',    amount:-11.00,  type:'expense', account:'Alex'  },
  { date:'2025-09-24', description:'Alex barbershop',                  category:'Other',            amount:-25.00,  type:'expense', account:'Alex'  },
  { date:'2025-09-25', description:'Tesco',                            category:'Groceries',        amount:-5.47,   type:'expense', account:'Alex'  },
  { date:'2025-09-25', description:'Dry cleaning',                     category:'Other',            amount:-48.40,  type:'expense', account:'Alex'  },
  { date:'2025-09-26', description:"Alex's holiday with a friend",     category:'Holiday & Travel', amount:-250.00, type:'expense', account:'Alex'  },
  { date:'2025-09-26', description:'House rent',                       category:'Bills & Utilities',amount:-500.00, type:'expense', account:'Alex'  },
  { date:'2025-09-26', description:'Alex salary',                      category:'Other',            amount:3878.83, type:'income',  account:'Alex'  },
  { date:'2025-09-27', description:'Boots',                            category:'Health & Medical', amount:-6.75,   type:'expense', account:'Kelly' },
  { date:'2025-09-27', description:'Kelly Three Mobile top up',        category:'Bills & Utilities',amount:-10.00,  type:'expense', account:'Kelly' },
  { date:'2025-09-27', description:'Communal expenses for the trip',   category:'Holiday & Travel', amount:-810.89, type:'expense', account:'Alex'  },
  { date:'2025-09-27', description:'HSBC bank fee',                    category:'Bills & Utilities',amount:-11.95,  type:'expense', account:'Alex'  },
];

const OCT_2025 = [
  { date:'2025-10-01', description:'Alex expenses from the trip',       category:'Holiday & Travel', amount:-49.89,  type:'expense', account:'Alex'  },
  { date:'2025-10-01', description:'Car tax',                          category:'Car',              amount:-26.68,  type:'expense', account:'Alex'  },
  { date:'2025-10-01', description:'Car insurance',                    category:'Car',              amount:-53.75,  type:'expense', account:'Alex'  },
  { date:'2025-10-02', description:'Alex audible',                     category:'Entertainment',    amount:-7.99,   type:'expense', account:'Alex'  },
  { date:'2025-10-04', description:'Sold skincare',                    category:'Other',            amount:280.00,  type:'income',  account:'Kelly' },
  { date:'2025-10-05', description:'Amazon vido',                      category:'Entertainment',    amount:-1.99,   type:'expense', account:'Alex'  },
  { date:'2025-10-05', description:'Kelly expenses from the trip',     category:'Holiday & Travel', amount:-262.13, type:'expense', account:'Kelly' },
  { date:'2025-10-05', description:'Alex expenses from the trip',      category:'Holiday & Travel', amount:-274.35, type:'expense', account:'Alex'  },
  { date:'2025-10-06', description:"Sainsbury's",                      category:'Groceries',        amount:-5.37,   type:'expense', account:'Kelly' },
  { date:'2025-10-06', description:'Costco',                           category:'Groceries',        amount:-113.44, type:'expense', account:'Alex'  },
  { date:'2025-10-06', description:'Tesco',                            category:'Groceries',        amount:-16.75,  type:'expense', account:'Alex'  },
  { date:'2025-10-07', description:'Alex History podcast',             category:'Entertainment',    amount:-6.00,   type:'expense', account:'Alex'  },
  { date:'2025-10-08', description:'Tesco',                            category:'Groceries',        amount:-10.48,  type:'expense', account:'Alex'  },
  { date:'2025-10-10', description:'Tesco',                            category:'Groceries',        amount:-4.85,   type:'expense', account:'Kelly' },
  { date:'2025-10-10', description:'Camera setup, carpet tape',        category:'Other',            amount:-21.13,  type:'expense', account:'Alex'  },
  { date:'2025-10-10', description:'Alex music',                       category:'Entertainment',    amount:-1.60,   type:'expense', account:'Alex'  },
  { date:'2025-10-10', description:"Alex - Tom's bday curry",          category:'Dining Out',       amount:-44.00,  type:'expense', account:'Alex'  },
  { date:'2025-10-13', description:'Alex Figure',                      category:'Entertainment',    amount:-19.50,  type:'expense', account:'Alex'  },
  { date:'2025-10-13', description:'Alex podcast subscription',        category:'Subscriptions',    amount:-3.49,   type:'expense', account:'Alex'  },
  { date:'2025-10-14', description:"Savings card - Sainsbury's",       category:'Groceries',        amount:-95.50,  type:'expense', account:'Kelly' },
  { date:'2025-10-14', description:'Alex YouTube',                     category:'Subscriptions',    amount:-4.99,   type:'expense', account:'Alex'  },
  { date:'2025-10-14', description:'Alex model show',                  category:'Entertainment',    amount:-37.50,  type:'expense', account:'Alex'  },
  { date:'2025-10-15', description:'Plant food',                       category:'Home & Garden',    amount:-2.50,   type:'expense', account:'Alex'  },
  { date:'2025-10-15', description:'Fine for airport drop off',        category:'Bills & Utilities',amount:-60.00,  type:'expense', account:'Alex'  },
  { date:'2025-10-16', description:'KJ Apple storage',                 category:'Subscriptions',    amount:-2.99,   type:'expense', account:'Kelly' },
  { date:'2025-10-16', description:"Kelly - Natalie's gift",           category:'Gifts',            amount:-57.30,  type:'expense', account:'Kelly' },
  { date:'2025-10-16', description:"Sainsbury's",                      category:'Groceries',        amount:-30.52,  type:'expense', account:'Alex'  },
  { date:'2025-10-16', description:'Internet broadband',               category:'Bills & Utilities',amount:-36.54,  type:'expense', account:'Alex'  },
  { date:'2025-10-17', description:'Heathrow parking',                 category:'Car',              amount:-6.00,   type:'expense', account:'Alex'  },
  { date:'2025-10-17', description:'Alex audible',                     category:'Entertainment',    amount:-3.99,   type:'expense', account:'Alex'  },
  { date:'2025-10-17', description:'Netflix subscription',             category:'Subscriptions',    amount:-5.99,   type:'expense', account:'Alex'  },
  { date:'2025-10-17', description:'Tesco',                            category:'Groceries',        amount:-26.48,  type:'expense', account:'Alex'  },
  { date:'2025-10-17', description:'Alex Floy models membership',      category:'Entertainment',    amount:-4.80,   type:'expense', account:'Alex'  },
  { date:'2025-10-17', description:'Cards',                            category:'Gifts',            amount:-2.50,   type:'expense', account:'Alex'  },
  { date:'2025-10-18', description:'Computer charger',                 category:'Shopping',         amount:-12.59,  type:'expense', account:'Alex'  },
  { date:'2025-10-20', description:'Amazon cable tidy',                category:'Shopping',         amount:-19.10,  type:'expense', account:'Alex'  },
  { date:'2025-10-20', description:'Alex pub with Jake',               category:'Dining Out',       amount:-37.92,  type:'expense', account:'Alex'  },
  { date:'2025-10-20', description:'Alex to work',                     category:'Transport',        amount:-6.80,   type:'expense', account:'Alex'  },
  { date:'2025-10-20', description:'Alex fish and chips',              category:'Dining Out',       amount:-15.00,  type:'expense', account:'Alex'  },
  { date:'2025-10-21', description:'Kelly hotels in Seoul',            category:'Holiday & Travel', amount:-64.16,  type:'expense', account:'Kelly' },
  { date:'2025-10-21', description:'Fine for airport drop off',        category:'Car',              amount:-60.00,  type:'expense', account:'Alex'  },
  { date:'2025-10-21', description:'AI coding subscription',           category:'Subscriptions',    amount:-18.00,  type:'expense', account:'Alex'  },
  { date:'2025-10-21', description:'Alex drinks with Joe',             category:'Dining Out',       amount:-23.25,  type:'expense', account:'Alex'  },
  { date:'2025-10-21', description:'Alex phone bill',                  category:'Bills & Utilities',amount:-5.00,   type:'expense', account:'Alex'  },
  { date:'2025-10-21', description:'Alex to work',                     category:'Transport',        amount:-5.20,   type:'expense', account:'Alex'  },
  { date:'2025-10-21', description:'Drinks',                           category:'Dining Out',       amount:-10.00,  type:'expense', account:'Alex'  },
  { date:'2025-10-21', description:'3D subscription',                  category:'Entertainment',    amount:-8.17,   type:'expense', account:'Alex'  },
  { date:'2025-10-22', description:'Car repairs',                      category:'Car',              amount:-144.78, type:'expense', account:'Alex'  },
  { date:'2025-10-22', description:'Alex kebab',                       category:'Dining Out',       amount:-10.00,  type:'expense', account:'Alex'  },
  { date:'2025-10-22', description:'Morrisons',                        category:'Groceries',        amount:-18.85,  type:'expense', account:'Alex'  },
  { date:'2025-10-23', description:'Bed payment installment',          category:'Home & Garden',    amount:-75.70,  type:'expense', account:'Alex'  },
  { date:'2025-10-24', description:'Alex pub with colleague',          category:'Dining Out',       amount:-26.20,  type:'expense', account:'Alex'  },
  { date:'2025-10-24', description:'Alex to work',                     category:'Transport',        amount:-8.00,   type:'expense', account:'Alex'  },
  { date:'2025-10-26', description:'Extension lead',                   category:'Shopping',         amount:-25.97,  type:'expense', account:'Alex'  },
  { date:'2025-10-27', description:'Alex hair product',                category:'Shopping',         amount:-11.88,  type:'expense', account:'Alex'  },
  { date:'2025-10-27', description:'Alex kebab',                       category:'Dining Out',       amount:-10.00,  type:'expense', account:'Alex'  },
  { date:'2025-10-27', description:'HSBC bank fee',                    category:'Bills & Utilities',amount:-11.95,  type:'expense', account:'Alex'  },
  { date:'2025-10-28', description:'Gifts for bday and Christmas',     category:'Gifts',            amount:-40.00,  type:'expense', account:'Alex'  },
  { date:'2025-10-28', description:'House rent',                       category:'Bills & Utilities',amount:-500.00, type:'expense', account:'Alex'  },
  { date:'2025-10-28', description:'Alex salary',                      category:'Other',            amount:3714.91, type:'income',  account:'Alex'  },
  { date:'2025-10-29', description:'Tesco',                            category:'Groceries',        amount:-24.25,  type:'expense', account:'Alex'  },
  { date:'2025-10-29', description:'Alex pub',                         category:'Dining Out',       amount:-40.50,  type:'expense', account:'Alex'  },
  { date:'2025-10-30', description:"Sainsbury's",                      category:'Groceries',        amount:-35.83,  type:'expense', account:'Alex'  },
];

const NOV_2025 = [
  { date:'2025-11-01', description:'Tesco',                             category:'Groceries',        amount:-25.61,  type:'expense', account:'Alex'  },
  { date:'2025-11-03', description:'Turkey for Christmas (half)',       category:'Groceries',        amount:-65.00,  type:'expense', account:'Alex'  },
  { date:'2025-11-03', description:'Tesco',                            category:'Groceries',        amount:-4.13,   type:'expense', account:'Alex'  },
  { date:'2025-11-03', description:'Alex fish and chips',              category:'Dining Out',       amount:-13.50,  type:'expense', account:'Alex'  },
  { date:'2025-11-03', description:'Car tax',                          category:'Car',              amount:-26.68,  type:'expense', account:'Alex'  },
  { date:'2025-11-03', description:'Car insurance',                    category:'Car',              amount:-53.75,  type:'expense', account:'Alex'  },
  { date:'2025-11-05', description:'Modelling glue',                   category:'Other',            amount:-5.29,   type:'expense', account:'Alex'  },
  { date:'2025-11-06', description:'Alex audible',                     category:'Subscriptions',    amount:-0.99,   type:'expense', account:'Alex'  },
  { date:'2025-11-07', description:'Petrol',                           category:'Car',              amount:-42.22,  type:'expense', account:'Alex'  },
  { date:'2025-11-07', description:'Tesco',                            category:'Groceries',        amount:-8.75,   type:'expense', account:'Alex'  },
  { date:'2025-11-07', description:'Alex History podcast',             category:'Entertainment',    amount:-6.00,   type:'expense', account:'Alex'  },
  { date:'2025-11-08', description:"Savings card - Sainsbury's",       category:'Groceries',        amount:-95.50,  type:'expense', account:'Kelly' },
  { date:'2025-11-08', description:'Alex modelling stuff',             category:'Other',            amount:-4.55,   type:'expense', account:'Alex'  },
  { date:'2025-11-08', description:'Airport pick up',                  category:'Car',              amount:-6.00,   type:'expense', account:'Alex'  },
  { date:'2025-11-08', description:'M&S food',                         category:'Groceries',        amount:-2.60,   type:'expense', account:'Alex'  },
  { date:'2025-11-09', description:'Alex burger king',                 category:'Dining Out',       amount:-6.49,   type:'expense', account:'Alex'  },
  { date:'2025-11-09', description:'Petrol',                           category:'Car',              amount:-67.11,  type:'expense', account:'Alex'  },
  { date:'2025-11-10', description:'Dad birthday gift (next year)',    category:'Gifts',            amount:-102.49, type:'expense', account:'Alex'  },
  { date:'2025-11-10', description:'Tesco',                            category:'Groceries',        amount:-18.34,  type:'expense', account:'Alex'  },
  { date:'2025-11-10', description:'Chinese takeaway',                 category:'Dining Out',       amount:-26.50,  type:'expense', account:'Alex'  },
  { date:'2025-11-11', description:'Alex coffee',                      category:'Dining Out',       amount:-4.10,   type:'expense', account:'Alex'  },
  { date:'2025-11-11', description:'Alex tube',                        category:'Transport',        amount:-4.60,   type:'expense', account:'Alex'  },
  { date:'2025-11-12', description:'Alex buying an umbrella',          category:'Shopping',         amount:-23.99,  type:'expense', account:'Alex'  },
  { date:'2025-11-12', description:'Alex tube',                        category:'Transport',        amount:-4.60,   type:'expense', account:'Alex'  },
  { date:'2025-11-13', description:'Amazon Prime membership',          category:'Subscriptions',    amount:-95.00,  type:'expense', account:'Alex'  },
  { date:'2025-11-13', description:'Drop off mum at airport',          category:'Car',              amount:-7.00,   type:'expense', account:'Alex'  },
  { date:'2025-11-13', description:'Amex card membership',             category:'Bills & Utilities',amount:-95.00,  type:'expense', account:'Alex'  },
  { date:'2025-11-13', description:'Alex holiday with friends',        category:'Holiday & Travel', amount:-147.95, type:'expense', account:'Alex'  },
  { date:'2025-11-13', description:'Alex podcast subscription',        category:'Subscriptions',    amount:-3.49,   type:'expense', account:'Alex'  },
  { date:'2025-11-14', description:'Alex Google channel',              category:'Subscriptions',    amount:-4.99,   type:'expense', account:'Alex'  },
  { date:'2025-11-16', description:'KJ Apple storage',                 category:'Subscriptions',    amount:-2.99,   type:'expense', account:'Kelly' },
  { date:'2025-11-16', description:'Netflix subscription',             category:'Subscriptions',    amount:-5.99,   type:'expense', account:'Alex'  },
  { date:'2025-11-16', description:'Alex Floy Models membership',      category:'Entertainment',    amount:-4.80,   type:'expense', account:'Alex'  },
  { date:'2025-11-17', description:'Alex holiday with friends',        category:'Holiday & Travel', amount:-253.27, type:'expense', account:'Alex'  },
  { date:'2025-11-19', description:'Alex tube',                        category:'Transport',        amount:-4.20,   type:'expense', account:'Alex'  },
  { date:'2025-11-19', description:'Alex lottery',                     category:'Entertainment',    amount:-10.00,  type:'expense', account:'Alex'  },
  { date:'2025-11-19', description:'Train refund',                     category:'Other',            amount:8.00,    type:'income',  account:'Alex'  },
  { date:'2025-11-19', description:"Savings card - Sainsbury's",       category:'Groceries',        amount:-95.50,  type:'expense', account:'Kelly' },
  { date:'2025-11-19', description:'Kelly underwear and stockings',    category:'Shopping',         amount:-22.74,  type:'expense', account:'Kelly' },
  { date:'2025-11-20', description:'Alex phone bill',                  category:'Bills & Utilities',amount:-5.00,   type:'expense', account:'Alex'  },
  { date:'2025-11-20', description:'Kelly tube',                       category:'Transport',        amount:-6.20,   type:'expense', account:'Kelly' },
  { date:'2025-11-20', description:'Kelly Three Mobile top up',        category:'Bills & Utilities',amount:-10.00,  type:'expense', account:'Kelly' },
  { date:'2025-11-20', description:'Kelly out with Okta London',       category:'Dining Out',       amount:-50.86,  type:'expense', account:'Kelly' },
  { date:'2025-11-21', description:'Groceries',                        category:'Groceries',        amount:-19.33,  type:'expense', account:'Alex'  },
  { date:'2025-11-22', description:'Alex tube',                        category:'Transport',        amount:-4.40,   type:'expense', account:'Alex'  },
  { date:'2025-11-22', description:'Kelly tube',                       category:'Transport',        amount:-4.40,   type:'expense', account:'Kelly' },
  { date:'2025-11-22', description:'Elche restaurant with Rob',        category:'Dining Out',       amount:-160.33, type:'expense', account:'Kelly' },
  { date:'2025-11-22', description:'Coffee and cake',                  category:'Dining Out',       amount:-12.90,  type:'expense', account:'Kelly' },
  { date:'2025-11-23', description:'Alex book',                        category:'Entertainment',    amount:-15.70,  type:'expense', account:'Alex'  },
  { date:'2025-11-23', description:"Sainsbury's",                      category:'Groceries',        amount:-4.74,   type:'expense', account:'Alex'  },
  { date:'2025-11-24', description:'Paint for modelling',              category:'Other',            amount:-9.99,   type:'expense', account:'Alex'  },
  { date:'2025-11-24', description:'Costco',                           category:'Groceries',        amount:-134.77, type:'expense', account:'Alex'  },
  { date:'2025-11-24', description:'Bed payment installment',          category:'Home & Garden',    amount:-75.70,  type:'expense', account:'Alex'  },
  { date:'2025-11-25', description:'Gift',                             category:'Gifts',            amount:-99.00,  type:'expense', account:'Kelly' },
  { date:'2025-11-25', description:'Kelly zooki vitamin C (x2)',       category:'Health & Medical', amount:-58.36,  type:'expense', account:'Kelly' },
  { date:'2025-11-25', description:'B&Q toilet seat',                  category:'Home & Garden',    amount:-44.70,  type:'expense', account:'Kelly' },
  { date:'2025-11-25', description:'Kelly dress shopping',             category:'Shopping',         amount:-15.02,  type:'expense', account:'Kelly' },
  { date:'2025-11-26', description:'Kelly - a book',                   category:'Other',            amount:-3.22,   type:'expense', account:'Kelly' },
  { date:'2025-11-26', description:'Kelly 2nd hand sweater',           category:'Shopping',         amount:-3.99,   type:'expense', account:'Kelly' },
  { date:'2025-11-26', description:'M&S pastries for afternoon tea',   category:'Groceries',        amount:-14.50,  type:'expense', account:'Kelly' },
  { date:'2025-11-27', description:'Candles',                          category:'Home & Garden',    amount:-3.00,   type:'expense', account:'Alex'  },
  { date:'2025-11-27', description:'Alex tube',                        category:'Transport',        amount:-10.90,  type:'expense', account:'Alex'  },
  { date:'2025-11-27', description:'Gift',                             category:'Gifts',            amount:-30.19,  type:'expense', account:'Alex'  },
  { date:'2025-11-27', description:'HSBC bank fee',                    category:'Bills & Utilities',amount:-11.95,  type:'expense', account:'Alex'  },
  { date:'2025-11-27', description:'Gift',                             category:'Gifts',            amount:-40.00,  type:'expense', account:'Kelly' },
  { date:'2025-11-27', description:'Kelly coffee',                     category:'Dining Out',       amount:-3.40,   type:'expense', account:'Kelly' },
  { date:'2025-11-27', description:'Kelly entrance fee for the fair',  category:'Other',            amount:-10.00,  type:'expense', account:'Kelly' },
  { date:'2025-11-27', description:'Kelly & Alex Korean buffet',       category:'Dining Out',       amount:-95.06,  type:'expense', account:'Kelly' },
  { date:'2025-11-27', description:'Kelly tube',                       category:'Transport',        amount:-9.60,   type:'expense', account:'Kelly' },
  { date:'2025-11-28', description:'Kotra London rebate',              category:'Other',            amount:2000.00, type:'income',  account:'Kelly' },
  { date:'2025-11-28', description:'Alex salary',                      category:'Other',            amount:3714.90, type:'income',  account:'Alex'  },
  { date:'2025-11-28', description:"Sainsbury's",                      category:'Groceries',        amount:-20.40,  type:'expense', account:'Alex'  },
  { date:'2025-11-28', description:'Waitrose',                         category:'Groceries',        amount:-7.96,   type:'expense', account:'Alex'  },
  { date:'2025-11-28', description:'Water',                            category:'Dining Out',       amount:-3.50,   type:'expense', account:'Alex'  },
  { date:'2025-11-28', description:'House rent',                       category:'Bills & Utilities',amount:-500.00, type:'expense', account:'Alex'  },
  { date:'2025-11-29', description:'Dinner - Alex and dad',            category:'Dining Out',       amount:-34.09,  type:'expense', account:'Alex'  },
  { date:'2025-11-29', description:'H Mart',                           category:'Groceries',        amount:-68.24,  type:'expense', account:'Alex'  },
  { date:'2025-11-30', description:'Kelly tube',                       category:'Transport',        amount:-6.80,   type:'expense', account:'Kelly' },
  { date:'2025-11-30', description:'Coal and wood',                    category:'Home & Garden',    amount:-34.97,  type:'expense', account:'Alex'  },
  { date:'2025-11-30', description:'Beer & fish cake',                 category:'Groceries',        amount:-14.40,  type:'expense', account:'Kelly' },
  { date:'2025-11-30', description:'Dinner & coffee',                  category:'Dining Out',       amount:-45.94,  type:'expense', account:'Kelly' },
];

const DEC_2025 = [
  { date:'2025-12-01', description:'International supermarket',        category:'Groceries',        amount:-4.84,   type:'expense', account:'Kelly' },
  { date:'2025-12-01', description:"Savings card - Sainsbury's",       category:'Groceries',        amount:-95.50,  type:'expense', account:'Kelly' },
  { date:'2025-12-01', description:'Costco food and wines',            category:'Groceries',        amount:-50.57,  type:'expense', account:'Alex'  },
  { date:'2025-12-01', description:'Waitrose',                         category:'Groceries',        amount:-4.00,   type:'expense', account:'Alex'  },
  { date:'2025-12-01', description:'Car insurance',                    category:'Car',              amount:-53.75,  type:'expense', account:'Alex'  },
  { date:'2025-12-01', description:'Car tax',                          category:'Car',              amount:-26.68,  type:'expense', account:'Alex'  },
  { date:'2025-12-02', description:'Saving card - M&S',                category:'Groceries',        amount:-46.00,  type:'expense', account:'Kelly' },
  { date:'2025-12-02', description:'Sold skincare',                    category:'Other',            amount:70.00,   type:'income',  account:'Kelly' },
  { date:'2025-12-02', description:'Tesco',                            category:'Groceries',        amount:-2.36,   type:'expense', account:'Alex'  },
  { date:'2025-12-04', description:"Lokoli's year-end party",          category:'Dining Out',       amount:-55.00,  type:'expense', account:'Kelly' },
  { date:'2025-12-04', description:'Kelly tube',                       category:'Transport',        amount:-7.90,   type:'expense', account:'Kelly' },
  { date:'2025-12-04', description:"Alex - Mum's birthday gift",       category:'Gifts',            amount:-13.46,  type:'expense', account:'Alex'  },
  { date:'2025-12-04', description:'Wine',                             category:'Dining Out',       amount:-29.60,  type:'expense', account:'Alex'  },
  { date:'2025-12-04', description:'Alex tube',                        category:'Transport',        amount:-7.90,   type:'expense', account:'Alex'  },
  { date:'2025-12-05', description:'Christmas tree & lights',          category:'Shopping',         amount:-48.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-06', description:'Tapes for decoration',             category:'Home & Garden',    amount:-3.11,   type:'expense', account:'Alex'  },
  { date:'2025-12-06', description:'Vacuum cleaner filters',           category:'Home & Garden',    amount:-12.74,  type:'expense', account:'Alex'  },
  { date:'2025-12-06', description:'Alex audible',                     category:'Subscriptions',    amount:-0.99,   type:'expense', account:'Alex'  },
  { date:'2025-12-06', description:'Tesco',                            category:'Groceries',        amount:-6.50,   type:'expense', account:'Alex'  },
  { date:'2025-12-06', description:"Alex - Mum's birthday cake",       category:'Gifts',            amount:-38.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-07', description:'Snacks',                           category:'Dining Out',       amount:-14.00,  type:'expense', account:'Kelly' },
  { date:'2025-12-07', description:'Xmas gift',                        category:'Gifts',            amount:-39.00,  type:'expense', account:'Kelly' },
  { date:'2025-12-07', description:'Coolant',                          category:'Car',              amount:-11.89,  type:'expense', account:'Alex'  },
  { date:'2025-12-07', description:'Alex - Laurie birthday gift',      category:'Gifts',            amount:-146.81, type:'expense', account:'Alex'  },
  { date:'2025-12-07', description:'Alex podcast subscription',        category:'Subscriptions',    amount:-6.00,   type:'expense', account:'Alex'  },
  { date:'2025-12-08', description:'Batteries',                        category:'Home & Garden',    amount:-8.50,   type:'expense', account:'Alex'  },
  { date:'2025-12-08', description:'Tesco',                            category:'Groceries',        amount:-4.90,   type:'expense', account:'Alex'  },
  { date:'2025-12-08', description:"Parking for Kelly's pop up",       category:'Car',              amount:-4.95,   type:'expense', account:'Alex'  },
  { date:'2025-12-08', description:'Beer',                             category:'Dining Out',       amount:-7.76,   type:'expense', account:'Alex'  },
  { date:'2025-12-08', description:'Alex takeaway kebab',              category:'Dining Out',       amount:-12.90,  type:'expense', account:'Alex'  },
  { date:'2025-12-09', description:'Kelly tube',                       category:'Transport',        amount:-4.40,   type:'expense', account:'Kelly' },
  { date:'2025-12-09', description:'Drinks at Jamiroquai concert',     category:'Dining Out',       amount:-14.70,  type:'expense', account:'Alex'  },
  { date:'2025-12-09', description:'Drinks at Jamiroquai concert',     category:'Dining Out',       amount:-29.40,  type:'expense', account:'Alex'  },
  { date:'2025-12-09', description:'Tesco',                            category:'Groceries',        amount:-0.60,   type:'expense', account:'Alex'  },
  { date:'2025-12-09', description:'Alex tube',                        category:'Transport',        amount:-4.40,   type:'expense', account:'Alex'  },
  { date:'2025-12-10', description:'Kelly wine',                       category:'Dining Out',       amount:-12.88,  type:'expense', account:'Kelly' },
  { date:'2025-12-10', description:'Kelly tube',                       category:'Transport',        amount:-6.80,   type:'expense', account:'Kelly' },
  { date:'2025-12-10', description:'Tea',                              category:'Dining Out',       amount:-6.50,   type:'expense', account:'Kelly' },
  { date:'2025-12-10', description:'Alex barbershop',                  category:'Other',            amount:-25.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-11', description:'Kelly wine',                       category:'Dining Out',       amount:-7.00,   type:'expense', account:'Kelly' },
  { date:'2025-12-11', description:'Kelly tube',                       category:'Transport',        amount:-6.95,   type:'expense', account:'Kelly' },
  { date:'2025-12-11', description:'Drinks',                           category:'Dining Out',       amount:-22.95,  type:'expense', account:'Alex'  },
  { date:'2025-12-11', description:'Alex work lunch',                  category:'Dining Out',       amount:-4.99,   type:'expense', account:'Alex'  },
  { date:'2025-12-11', description:'Alex tube',                        category:'Transport',        amount:-10.90,  type:'expense', account:'Alex'  },
  { date:'2025-12-11', description:'Alex expensive dinner out',        category:'Dining Out',       amount:-97.61,  type:'expense', account:'Alex'  },
  { date:'2025-12-12', description:'International supermarket',        category:'Groceries',        amount:-1.98,   type:'expense', account:'Kelly' },
  { date:'2025-12-12', description:'Kelly tube',                       category:'Transport',        amount:-4.05,   type:'expense', account:'Kelly' },
  { date:'2025-12-12', description:'Alex tube',                        category:'Transport',        amount:-4.05,   type:'expense', account:'Alex'  },
  { date:'2025-12-12', description:"Sainsbury's",                      category:'Groceries',        amount:-37.25,  type:'expense', account:'Alex'  },
  { date:'2025-12-13', description:'Kelly bus',                        category:'Transport',        amount:-5.60,   type:'expense', account:'Kelly' },
  { date:'2025-12-13', description:'Petrol',                           category:'Car',              amount:-25.36,  type:'expense', account:'Alex'  },
  { date:'2025-12-13', description:'Alex tube',                        category:'Transport',        amount:-5.60,   type:'expense', account:'Alex'  },
  { date:'2025-12-14', description:"Savings card - Sainsbury's",       category:'Groceries',        amount:-95.50,  type:'expense', account:'Kelly' },
  { date:'2025-12-15', description:'Xmas gift',                        category:'Gifts',            amount:-15.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-15', description:'Present for Nora',                 category:'Gifts',            amount:-50.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-15', description:'Alex live stream concert',         category:'Entertainment',    amount:-12.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-15', description:"Mum's birthday balloons",          category:'Gifts',            amount:-32.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-15', description:'Present for Bev',                  category:'Gifts',            amount:-37.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-15', description:'Present for Bev',                  category:'Gifts',            amount:-17.98,  type:'expense', account:'Alex'  },
  { date:'2025-12-15', description:"Beer for Jo's party",              category:'Dining Out',       amount:-6.99,   type:'expense', account:'Alex'  },
  { date:'2025-12-16', description:'KJ Apple storage',                 category:'Subscriptions',    amount:-2.99,   type:'expense', account:'Kelly' },
  { date:'2025-12-16', description:'Xmas gift for dad',                category:'Gifts',            amount:-35.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-16', description:'Gift for Sudeng',                  category:'Gifts',            amount:-25.48,  type:'expense', account:'Alex'  },
  { date:'2025-12-16', description:'Internet broadband',               category:'Bills & Utilities',amount:-36.54,  type:'expense', account:'Alex'  },
  { date:'2025-12-17', description:"Alex - Mum's birthday dinner",     category:'Dining Out',       amount:-55.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-17', description:'Waitrose',                         category:'Groceries',        amount:-36.06,  type:'expense', account:'Alex'  },
  { date:'2025-12-17', description:'Alex Floy Models membership',      category:'Entertainment',    amount:-4.80,   type:'expense', account:'Alex'  },
  { date:'2025-12-19', description:'M&S',                              category:'Groceries',        amount:-10.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-20', description:'Kelly xmas gift',                  category:'Gifts',            amount:-370.00, type:'expense', account:'Alex'  },
  { date:'2025-12-20', description:'Lunch with S&H at Zadel',          category:'Dining Out',       amount:-241.56, type:'expense', account:'Alex'  },
  { date:'2025-12-20', description:'Alex phone bill',                  category:'Bills & Utilities',amount:-5.00,   type:'expense', account:'Alex'  },
  { date:'2025-12-20', description:"Mum's xmas gift",                  category:'Gifts',            amount:-13.99,  type:'expense', account:'Alex'  },
  { date:'2025-12-20', description:'Alex tube',                        category:'Transport',        amount:-6.80,   type:'expense', account:'Alex'  },
  { date:'2025-12-20', description:"Mum's xmas gift",                  category:'Gifts',            amount:-19.99,  type:'expense', account:'Alex'  },
  { date:'2025-12-20', description:'Kelly tube',                       category:'Transport',        amount:-6.80,   type:'expense', account:'Kelly' },
  { date:'2025-12-21', description:'Xmas wine',                        category:'Groceries',        amount:-84.44,  type:'expense', account:'Alex'  },
  { date:'2025-12-21', description:"Mum's xmas gift",                  category:'Gifts',            amount:-24.95,  type:'expense', account:'Alex'  },
  { date:'2025-12-21', description:'Cheese for xmas',                  category:'Groceries',        amount:-18.01,  type:'expense', account:'Alex'  },
  { date:'2025-12-21', description:'Alex tube',                        category:'Transport',        amount:-6.80,   type:'expense', account:'Alex'  },
  { date:'2025-12-21', description:'Cheese for xmas',                  category:'Groceries',        amount:-16.41,  type:'expense', account:'Alex'  },
  { date:'2025-12-21', description:'Kelly buying coffee - S&H visiting',category:'Dining Out',      amount:-17.25,  type:'expense', account:'Kelly' },
  { date:'2025-12-22', description:'South Woodford parking',           category:'Car',              amount:-7.50,   type:'expense', account:'Kelly' },
  { date:'2025-12-22', description:'Alex salary',                      category:'Other',            amount:3714.91, type:'income',  account:'Alex'  },
  { date:'2025-12-22', description:'Xmas gift for Bev',                category:'Gifts',            amount:-41.08,  type:'expense', account:'Alex'  },
  { date:'2025-12-22', description:'Roman Bath entrance fee',          category:'Holiday & Travel', amount:-55.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-22', description:'Dinner at service station',        category:'Dining Out',       amount:-18.58,  type:'expense', account:'Alex'  },
  { date:'2025-12-22', description:'Alex bookmark',                    category:'Shopping',         amount:-3.50,   type:'expense', account:'Alex'  },
  { date:'2025-12-22', description:'Cafe in Bath',                     category:'Dining Out',       amount:-16.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-22', description:'Cheese for xmas',                  category:'Groceries',        amount:-12.54,  type:'expense', account:'Alex'  },
  { date:'2025-12-22', description:'Salami for xmas',                  category:'Groceries',        amount:-20.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-22', description:'Kebab for dinner',                 category:'Dining Out',       amount:-63.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-22', description:'Tire pressure',                    category:'Car',              amount:-0.50,   type:'expense', account:'Alex'  },
  { date:'2025-12-22', description:'Lunch in Bath - S&H visiting',     category:'Dining Out',       amount:-96.20,  type:'expense', account:'Kelly' },
  { date:'2025-12-22', description:'Kelly shopping in Bath',           category:'Shopping',         amount:-15.49,  type:'expense', account:'Kelly' },
  { date:'2025-12-22', description:"Alex's xmas gift",                 category:'Gifts',            amount:-11.99,  type:'expense', account:'Kelly' },
  { date:'2025-12-23', description:"Sainsbury's",                      category:'Groceries',        amount:-0.54,   type:'expense', account:'Alex'  },
  { date:'2025-12-23', description:'Waitrose',                         category:'Groceries',        amount:-8.75,   type:'expense', account:'Alex'  },
  { date:'2025-12-23', description:'Candle holders',                   category:'Shopping',         amount:-8.95,   type:'expense', account:'Alex'  },
  { date:'2025-12-23', description:'Bed payment installment',          category:'Home & Garden',    amount:-75.70,  type:'expense', account:'Alex'  },
  { date:'2025-12-23', description:'Kelly xmas gift',                  category:'Gifts',            amount:-44.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-23', description:'Kelly tube',                       category:'Transport',        amount:-8.00,   type:'expense', account:'Kelly' },
  { date:'2025-12-23', description:'Kelly Three Mobile top up',        category:'Bills & Utilities',amount:-10.00,  type:'expense', account:'Kelly' },
  { date:'2025-12-23', description:"Alex's xmas gift",                 category:'Shopping',         amount:-33.00,  type:'expense', account:'Kelly' },
  { date:'2025-12-24', description:'Tesco',                            category:'Groceries',        amount:-4.35,   type:'expense', account:'Alex'  },
  { date:'2025-12-24', description:"Tony's fish bar",                  category:'Dining Out',       amount:-13.50,  type:'expense', account:'Alex'  },
  { date:'2025-12-24', description:'Pizza takeaway Xmas Eve dinner',   category:'Dining Out',       amount:-34.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-24', description:'Parking in Bath',                  category:'Car',              amount:-14.50,  type:'expense', account:'Alex'  },
  { date:'2025-12-24', description:"HM's xmas gift",                   category:'Gifts',            amount:-12.00,  type:'expense', account:'Alex'  },
  { date:'2025-12-24', description:"Savings card - Sainsbury's",       category:'Groceries',        amount:-47.75,  type:'expense', account:'Kelly' },
  { date:'2025-12-24', description:"Sudeng's 2026 birthday gift",      category:'Gifts',            amount:-55.00,  type:'expense', account:'Kelly' },
  { date:'2025-12-24', description:'Kelly tube',                       category:'Transport',        amount:-4.40,   type:'expense', account:'Kelly' },
  { date:'2025-12-24', description:'Coffee',                           category:'Dining Out',       amount:-12.15,  type:'expense', account:'Kelly' },
  { date:'2025-12-25', description:'Spotify subscription',             category:'Subscriptions',    amount:-12.99,  type:'expense', account:'Alex'  },
  { date:'2025-12-27', description:'Heathrow parking',                 category:'Car',              amount:-11.50,  type:'expense', account:'Alex'  },
  { date:'2025-12-27', description:'Tesco',                            category:'Groceries',        amount:-3.75,   type:'expense', account:'Alex'  },
  { date:'2025-12-27', description:'HSBC bank fee',                    category:'Bills & Utilities',amount:-11.95,  type:'expense', account:'Alex'  },
  { date:'2025-12-28', description:'Fish & chips takeaway',            category:'Dining Out',       amount:-29.51,  type:'expense', account:'Alex'  },
  { date:'2025-12-28', description:'House rent',                       category:'Bills & Utilities',amount:-500.00, type:'expense', account:'Alex'  },
  { date:'2025-12-29', description:'Logs coal and wood',               category:'Home & Garden',    amount:-38.46,  type:'expense', account:'Alex'  },
  { date:'2025-12-29', description:'French wines (12 bottles)',        category:'Groceries',        amount:-138.00, type:'expense', account:'Alex'  },
  { date:'2025-12-29', description:'Kelly drinks with friends',        category:'Dining Out',       amount:-46.39,  type:'expense', account:'Kelly' },
  { date:'2025-12-29', description:'Kelly dinner with friends',        category:'Dining Out',       amount:-42.86,  type:'expense', account:'Kelly' },
  { date:'2025-12-29', description:'Kelly tube',                       category:'Transport',        amount:-3.40,   type:'expense', account:'Kelly' },
  { date:'2025-12-30', description:'Kelly Bolt taxi',                  category:'Transport',        amount:-37.34,  type:'expense', account:'Alex'  },
  { date:'2025-12-30', description:'Netflix subscription',             category:'Subscriptions',    amount:-5.99,   type:'expense', account:'Alex'  },
  { date:'2025-12-30', description:'Slice pizza takeaway',             category:'Dining Out',       amount:-30.95,  type:'expense', account:'Alex'  },
];

const HISTORY = [
  { label: 'September 2025', sub: '76 transactions · £3,564.73 expenses · £3,918.83 income', data: SEP_2025 },
  { label: 'October 2025',   sub: '63 transactions · £2,570.09 expenses · £3,994.91 income', data: OCT_2025 },
  { label: 'November 2025', sub: '81 transactions · £3,075.22 expenses · £5,722.90 income', data: NOV_2025 },
  { label: 'December 2025', sub: '126 transactions · £4,067.98 expenses · £3,784.91 income', data: DEC_2025 },
  { label: 'January 2026',  sub: '84 transactions · £4,149.51 expenses · £4,419.86 income',  data: JAN_2026 },
  { label: 'February 2026', sub: '114 transactions · £3,297.68 expenses · £3,929.31 income', data: FEB_2026 },
  { label: 'March 2026',    sub: '77 transactions · £2,695.94 expenses · £3,939.31 income',  data: MAR_2026 },
  { label: 'April 2026',    sub: '103 transactions · £3,067.26 expenses · £3,681.28 income', data: APR_2026 },
  { label: 'May 2026',      sub: '37 transactions · £1,724.46 expenses · £23.74 income',     data: MAY_2026 },
];

export default function ImportView({ importTxs, setView, txs }) {
  const [dragOver,  setDragOver]  = useState(false);
  const [preview,   setPreview]   = useState(null);
  const [error,     setError]     = useState('');
  const [done,      setDone]      = useState(false);
  const [loading,   setLoading]   = useState(null);
  const fileRef = useRef();

  const parse = file => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const rows = data.map((r, i) => ({
          id:          Date.now() + i,
          date:        r.date?.trim()        || todayStr(),
          description: r.description?.trim() || '',
          category:    r.category?.trim()    || 'Other',
          amount:      parseFloat(r.amount)  || 0,
          type:        r.type?.trim()        || 'expense',
          account:     r.account?.trim()     || 'Alex',
        })).filter(r => r.description && r.amount !== 0);
        if (!rows.length) { setError('No valid rows found. Check your CSV format.'); return; }
        setPreview(rows);
        setError('');
      },
      error: () => setError('Failed to parse CSV. Please check the file.'),
    });
  };

  const confirm = async () => {
    await importTxs(preview);
    setPreview(null);
    setDone(true);
    setTimeout(() => { setDone(false); setView('dashboard'); }, 2000);
  };

  const monthImported = label => {
    const entry = HISTORY.find(h => h.label === label);
    if (!entry?.data?.length) return false;
    const monthKey = entry.data[0].date.slice(0, 7);
    return txs.some(t => t.date?.startsWith(monthKey));
  };

  const loadHistory = async label => {
    const entry = HISTORY.find(h => h.label === label);
    if (!entry) return;
    setLoading(label);
    await importTxs(entry.data.map((r, i) => ({ ...r, id: Date.now() + i })));
    setLoading(null);
    setDone(true);
    setTimeout(() => { setDone(false); setView('dashboard'); }, 2000);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 20 }}>Import</div>

      {!preview && !done && (
        <>
          {(() => {
            const pending = HISTORY.filter(h => !monthImported(h.label));
            if (!pending.length) return null;
            return (
              <>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10, color: C.muted }}>Historical data</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {pending.map(h => (
                    <Card key={h.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '14px 20px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{h.label}</div>
                        <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{h.sub}</div>
                      </div>
                      <button onClick={() => loadHistory(h.label)} disabled={!!loading} style={{
                        padding: '8px 18px', borderRadius: 10, border: 'none',
                        background: loading === h.label ? C.muted : C.primary,
                        color: '#FFF', fontWeight: 600, fontSize: 13,
                        cursor: loading ? 'default' : 'pointer',
                        fontFamily: "'Outfit', sans-serif", flexShrink: 0,
                      }}>
                        {loading === h.label ? 'Importing…' : 'Import'}
                      </button>
                    </Card>
                  ))}
                </div>
              </>
            );
          })()}

          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10, color: C.muted }}>Import from CSV</div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Expected format</div>
            <pre style={{
              fontFamily: 'monospace', fontSize: 12, background: C.bg,
              padding: 12, borderRadius: 8, color: C.text, overflowX: 'auto',
            }}>
{`date, description, category, amount, type, account
2026-01-15, Tesco, Groceries, -45.20, expense, Alex
2026-01-01, Vinted earnings, Income, 23.74, income, Kelly`}
            </pre>
          </Card>

          <div
            onClick={() => fileRef.current?.click()}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) parse(f); }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            style={{
              border: `2px dashed ${dragOver ? C.primary : C.border}`, borderRadius: 16,
              padding: '52px 24px', textAlign: 'center', cursor: 'pointer',
              background: dragOver ? `${C.primary}08` : C.card, transition: 'all 0.12s',
            }}
          >
            <Upload size={32} color={dragOver ? C.primary : C.muted} style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Drop your CSV here</div>
            <div style={{ color: C.muted, fontSize: 14 }}>or click to browse</div>
            <input ref={fileRef} type="file" accept=".csv"
              onChange={e => { if (e.target.files[0]) parse(e.target.files[0]); }}
              style={{ display: 'none' }} />
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
              borderRadius: 10, marginTop: 12, background: '#FEF2F2', color: C.expense, fontSize: 14,
            }}>
              <AlertCircle size={15} />{error}
            </div>
          )}
        </>
      )}

      {done && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: 16, borderRadius: 12,
          background: '#F0FDF4', color: C.income, fontSize: 15, fontWeight: 600,
        }}>
          <Check size={20} />Import successful! Redirecting to dashboard…
        </div>
      )}

      {preview && (
        <>
          {(() => {
            const existingKeys = new Set(txs.map(t => `${t.date}|${t.description}|${t.amount}`));
            const dupeCount = preview.filter(r => existingKeys.has(`${r.date}|${r.description}|${r.amount}`)).length;
            const newCount  = preview.length - dupeCount;
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    Preview — {preview.length} row{preview.length !== 1 ? 's' : ''}
                  </div>
                  {dupeCount > 0 && (
                    <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
                      {newCount} new · {dupeCount} duplicate{dupeCount !== 1 ? 's' : ''} will be skipped
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setPreview(null)} style={{
                    padding: '8px 16px', borderRadius: 10, border: `1px solid ${C.border}`,
                    background: 'transparent', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                  }}>Cancel</button>
                  <Btn onClick={confirm} primary>{newCount > 0 ? `Import ${newCount} new` : 'Nothing new'}</Btn>
                </div>
              </div>
            );
          })()}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.bg }}>
                    {['Date', 'Description', 'Category', 'Amount', 'Type', 'Account'].map(h => (
                      <th key={h} style={{
                        padding: '10px 12px', textAlign: 'left', fontWeight: 600,
                        color: C.muted, borderBottom: `1px solid ${C.border}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 50).map((r, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '10px 12px', color: C.muted }}>{r.date}</td>
                      <td style={{ padding: '10px 12px' }}>{r.description}</td>
                      <td style={{ padding: '10px 12px', color: C.muted }}>{r.category}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: r.amount >= 0 ? C.income : C.expense }}>
                        {r.amount >= 0 ? '+' : ''}£{Math.abs(r.amount).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: `${TYPE_COLOR[r.type] || '#6B7280'}20`,
                          color:       TYPE_COLOR[r.type] || '#6B7280',
                        }}>{r.type}</span>
                      </td>
                      <td style={{ padding: '10px 12px', color: C.muted }}>{r.account || 'Alex'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 50 && (
                <div style={{ padding: 12, textAlign: 'center', color: C.muted, fontSize: 13 }}>
                  +{preview.length - 50} more rows not shown
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

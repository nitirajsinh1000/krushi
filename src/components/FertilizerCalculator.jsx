import React, { useState, useMemo, useEffect, useRef } from "react";

const CROPS = [
  {id:"paddy1",en:"Paddy (Nawagam)",gu:"ડાંગર (નવાગામ)",cat:"cereal",season:"K",nB:40,nT1:40,nT2:40,nT3:0,pB:30,kB:0,sB:25,caB:0,mgB:0,micro:"ZnSO₄ 25 kg/ha basal",src:"AAU 17th AGRESCO 2021",link:"https://aau.in"},
  {id:"paddy2",en:"Paddy (Dabhoi)",gu:"ડાંગર (ડભોઈ)",cat:"cereal",season:"K",nB:33.33,nT1:33.33,nT2:33.33,nT3:0,pB:30,kB:0,sB:25,caB:0,mgB:0,micro:"ZnSO₄ 25 kg/ha",src:"AAU 17th AGRESCO 2021",link:"https://aau.in"},
  {id:"maizeK",en:"Maize (Kharif)",gu:"મકાઈ (ખરીફ)",cat:"cereal",season:"K",nB:40,nT1:40,nT2:40,nT3:0,pB:60,kB:40,sB:25,caB:0,mgB:0,micro:"ZnSO₄ 25 kg/ha",src:"AAU 34th AGRESCO 1998",link:"https://aau.in"},
  {id:"maizeR",en:"Maize (Rabi)",gu:"મકાઈ (રવિ)",cat:"cereal",season:"R",nB:50,nT1:50,nT2:50,nT3:0,pB:60,kB:40,sB:25,caB:0,mgB:0,micro:"ZnSO₄ 25 kg/ha",src:"AAU 34th AGRESCO 1998",link:"https://aau.in"},
  {id:"maizeS",en:"Maize (Summer)",gu:"મકાઈ (ઉનાળુ)",cat:"cereal",season:"S",nB:50,nT1:50,nT2:50,nT3:0,pB:60,kB:40,sB:25,caB:0,mgB:0,micro:"ZnSO₄ 25 kg/ha",src:"AAU 34th AGRESCO 1998",link:"https://aau.in"},
  {id:"bajraRf",en:"Pearl Millet (Rainfed)",gu:"બાજરી (બિનસિંચાઈ)",cat:"cereal",season:"K",nB:26.67,nT1:26.67,nT2:26.67,nT3:0,pB:40,kB:0,sB:20,caB:0,mgB:0,kdef:20,micro:"ZnSO₄ 25 kg/ha",src:"JAU Targhadia DFRS",link:"https://jau.in"},
  {id:"bajraIrr",en:"Pearl Millet (Irrigated)",gu:"બાજરી (સિંચાઈ)",cat:"cereal",season:"K",nB:40,nT1:40,nT2:40,nT3:0,pB:60,kB:0,sB:20,caB:0,mgB:0,kdef:20,micro:"ZnSO₄ 25 kg/ha",src:"AAU 34th AGRESCO 1998",link:"https://aau.in"},
  {id:"jowarK",en:"Sorghum (Jowar)",gu:"જુવાર",cat:"cereal",season:"K",nB:26.67,nT1:26.67,nT2:26.67,nT3:0,pB:40,kB:20,sB:20,caB:0,mgB:0,micro:"FYM 5 t/ha",src:"JAU Targhadia DFRS",link:"https://jau.in"},
  {id:"ragi",en:"Finger Millet (Ragi)",gu:"રાગી",cat:"cereal",season:"K",nB:20,nT1:20,nT2:20,nT3:0,pB:30,kB:30,sB:20,caB:0,mgB:0,micro:"ZnSO₄ 10 kg/ha",src:"ICAR AICRP Small Millets",link:"https://icar.org.in"},
  {id:"wheat1",en:"Wheat (Irrigated)",gu:"ઘઉં (સિંચાઈ)",cat:"cereal",season:"R",nB:60,nT1:30,nT2:30,nT3:0,pB:60,kB:0,sB:30,caB:0,mgB:0,micro:"ZnSO₄ 25 kg/ha",src:"AAU 31st AGRESCO 1995",link:"https://aau.in"},
  {id:"wheat2",en:"Wheat (Bhal)",gu:"ઘઉં (ભાલ)",cat:"cereal",season:"R",nB:60,nT1:30,nT2:30,nT3:0,pB:60,kB:0,sB:30,caB:0,mgB:0,micro:"Gypsum 200 kg/ha",src:"AAU Arnej RS Bhal",link:"https://aau.in"},
  {id:"barley",en:"Barley",gu:"જવ",cat:"cereal",season:"R",nB:40,nT1:20,nT2:20,nT3:0,pB:40,kB:20,sB:20,caB:0,mgB:0,micro:"FYM 5 t/ha",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"groundnutIrr",en:"Groundnut (Irr)",gu:"મગફળી (સિંચાઈ)",cat:"oilseed",season:"K",nB:8.33,nT1:8.33,nT2:8.33,nT3:0,pB:50,kB:0,sB:40,caB:30,mgB:15,kdef:20,micro:"Gypsum 500 kg/ha",src:"ICAR Kharif 2025",link:"https://icar.org.in"},
  {id:"groundnutRf",en:"Groundnut (Rf)",gu:"મગફળી (બિનસિંચાઈ)",cat:"oilseed",season:"K",nB:4.17,nT1:4.17,nT2:4.17,nT3:0,pB:25,kB:0,sB:40,caB:30,mgB:15,kdef:20,micro:"Gypsum 500 kg/ha",src:"JAU Targhadia",link:"https://jau.in"},
  {id:"soybean",en:"Soybean",gu:"સોયાબીન",cat:"oilseed",season:"K",nB:6.67,nT1:6.67,nT2:6.67,nT3:0,pB:80,kB:40,sB:25,caB:0,mgB:0,micro:"Gypsum 200 kg/ha",src:"AAU AGRESCO",link:"https://aau.in"},
  {id:"castorIrr",en:"Castor (Irr)",gu:"એરંડા (સિંચાઈ)",cat:"oilseed",season:"K",nB:60,nT1:60,nT2:60,nT3:0,pB:40,kB:0,sB:20,caB:0,mgB:0,kdef:20,micro:"Borax 10 kg/ha",src:"JAU Junagadh",link:"https://jau.in"},
  {id:"castorRf",en:"Castor (Rf)",gu:"એરંડા (બિનસિંચાઈ)",cat:"oilseed",season:"K",nB:60,nT1:60,nT2:60,nT3:0,pB:40,kB:0,sB:20,caB:0,mgB:0,kdef:20,micro:"Gypsum 200 kg/ha",src:"JAU Targhadia",link:"https://jau.in"},
  {id:"sesameK",en:"Sesame (Til)",gu:"તલ",cat:"oilseed",season:"K",nB:16.67,nT1:16.67,nT2:16.67,nT3:0,pB:25,kB:0,sB:20,caB:0,mgB:0,kdef:20,micro:"Gypsum 125 kg/ha",src:"JAU Amreli RS",link:"https://jau.in"},
  {id:"blackgram",en:"Blackgram (Urad)",gu:"અડદ",cat:"pulse",season:"K",nB:20,nT1:0,nT2:0,nT3:0,pB:40,kB:20,sB:17.5,caB:20,mgB:0,micro:"Rhizobium",src:"NAU Kiosk",link:"https://nau.in"},
  {id:"greengramK",en:"Greengram (Moong)",gu:"મગ",cat:"pulse",season:"K",nB:20,nT1:0,nT2:0,nT3:0,pB:40,kB:20,sB:17.5,caB:20,mgB:0,micro:"Rhizobium+PSB",src:"NAU Kiosk",link:"https://nau.in"},
  {id:"redgram",en:"Redgram (Tur)",gu:"તુવેર",cat:"pulse",season:"K",nB:6.67,nT1:6.67,nT2:6.67,nT3:0,pB:50,kB:0,sB:17.5,caB:20,mgB:0,kdef:20,micro:"Rhizobium+PSB",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"cowpeaK",en:"Cowpea",gu:"ચોળા",cat:"pulse",season:"K",nB:20,nT1:0,nT2:0,nT3:0,pB:40,kB:20,sB:17.5,caB:20,mgB:0,micro:"Rhizobium",src:"AAU AGRESCO",link:"https://aau.in"},
  {id:"guar",en:"Clusterbean (Guar)",gu:"ગુવાર",cat:"pulse",season:"K",nB:20,nT1:0,nT2:0,nT3:0,pB:40,kB:20,sB:10,caB:15,mgB:0,micro:"Rhizobium",src:"AAU AGRESCO",link:"https://aau.in"},
  {id:"mothbean",en:"Moth Bean",gu:"મોઠ",cat:"pulse",season:"K",nB:20,nT1:0,nT2:0,nT3:0,pB:40,kB:0,sB:17.5,caB:20,mgB:0,kdef:20,micro:"Rhizobium",src:"DAG Gujarat",link:"https://dag.gujarat.gov.in"},
  {id:"horsegramK",en:"Horse Gram",gu:"કળથી",cat:"pulse",season:"K",nB:20,nT1:0,nT2:0,nT3:0,pB:40,kB:0,sB:17.5,caB:20,mgB:0,kdef:20,micro:"Rhizobium",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"chickpea",en:"Chickpea (Chana)",gu:"ચણા",cat:"pulse",season:"R",nB:20,nT1:0,nT2:0,nT3:0,pB:50,kB:20,sB:17.5,caB:20,mgB:0,micro:"Rhizobium+PSB",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"lentil",en:"Lentil (Masoor)",gu:"મસૂર",cat:"pulse",season:"R",nB:20,nT1:0,nT2:0,nT3:0,pB:40,kB:20,sB:17.5,caB:20,mgB:0,micro:"Rhizobium+PSB",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"fieldpea",en:"Field Pea",gu:"વટાણા (ખેતી)",cat:"pulse",season:"R",nB:20,nT1:0,nT2:0,nT3:0,pB:60,kB:40,sB:17.5,caB:10,mgB:0,micro:"Rhizobium",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"cottonIrr",en:"Cotton Bt (Drip)",gu:"કપાસ બીટી (ટપક)",cat:"cash",season:"K",nB:60,nT1:90,nT2:90,nT3:0,pB:60,kB:60,sB:20,caB:0,mgB:37.5,micro:"MgSO₄ foliar",src:"AAU 14th AGRESCO 2018",link:"https://aau.in"},
  {id:"cottonRf",en:"Cotton Bt (Rainfed)",gu:"કપાસ બીટી (બિનસિંચાઈ)",cat:"cash",season:"K",nB:20,nT1:30,nT2:30,nT3:0,pB:0,kB:0,sB:20,caB:0,mgB:37.5,kdef:30,micro:"MgSO₄ 10g/L foliar",src:"JAU Dhari",link:"https://jau.in"},
  {id:"sugarcane",en:"Sugarcane",gu:"શેરડી",cat:"cash",season:"K",nB:62.5,nT1:62.5,nT2:62.5,nT3:62.5,pB:125,kB:125,sB:30,caB:0,mgB:37.5,micro:"Zn 5 kg/ha",src:"AAU 39th AGRESCO 2003",link:"https://aau.in"},
  {id:"tobacco",en:"Tobacco (Rabi)",gu:"તમાકુ (રવિ)",cat:"cash",season:"R",nB:45,nT1:45,nT2:0,nT3:0,pB:45,kB:90,sB:20,caB:0,mgB:15,micro:"Avoid Cl",src:"DAG Gujarat",link:"https://dag.gujarat.gov.in"},
  {id:"turmeric",en:"Turmeric",gu:"હળદર",cat:"spice",season:"K",nB:50,nT1:50,nT2:50,nT3:0,pB:60,kB:120,sB:22.5,caB:30,mgB:30,micro:"FYM 30 t/ha",src:"ICAR NHB",link:"https://nhb.gov.in"},
  {id:"ginger",en:"Ginger",gu:"આદું",cat:"spice",season:"K",nB:25,nT1:25,nT2:25,nT3:0,pB:50,kB:50,sB:15,caB:0,mgB:0,micro:"FYM 25-30 t/ha",src:"ICAR NHB",link:"https://nhb.gov.in"},
  {id:"cumin",en:"Cumin (Jeera)",gu:"જીરું",cat:"spice",season:"R",nB:20,nT1:20,nT2:0,nT3:0,pB:30,kB:30,sB:12.5,caB:0,mgB:0,micro:"ZnSO₄ 10 kg/ha",src:"NRCSS + SDAU",link:"https://dag.gujarat.gov.in"},
  {id:"coriander",en:"Coriander (Dhana)",gu:"કોથમીર",cat:"spice",season:"R",nB:30,nT1:0,nT2:0,nT3:0,pB:20,kB:0,sB:15,caB:0,mgB:0,kdef:20,micro:"FYM 5 t/ha",src:"DAG Gujarat",link:"https://dag.gujarat.gov.in"},
  {id:"fennel",en:"Fennel (Saunf)",gu:"વરિયાળી",cat:"spice",season:"R",nB:20,nT1:20,nT2:0,nT3:0,pB:20,kB:0,sB:15,caB:0,mgB:0,kdef:20,micro:"Borax 10 kg/ha",src:"DAG Gujarat",link:"https://dag.gujarat.gov.in"},
  {id:"fenugreek",en:"Fenugreek (Methi)",gu:"મેથી",cat:"spice",season:"R",nB:20,nT1:0,nT2:0,nT3:0,pB:40,kB:20,sB:15,caB:0,mgB:0,micro:"FYM 10 t/ha",src:"DAG Gujarat",link:"https://dag.gujarat.gov.in"},
  {id:"isabgol",en:"Isabgol",gu:"ઈસબગુલ",cat:"spice",season:"R",nB:30,nT1:0,nT2:0,nT3:0,pB:20,kB:0,sB:20,caB:0,mgB:0,kdef:20,micro:"Gypsum 200 kg/ha",src:"SDAU",link:"https://dag.gujarat.gov.in"},
  {id:"okraK",en:"Okra (Bhindi)",gu:"ભીંડા",cat:"vegetable",season:"K",nB:75,nT1:75,nT2:0,nT3:0,pB:50,kB:50,sB:25,caB:20,mgB:15,micro:"FYM 20 t/ha",src:"AAU + JAU",link:"https://aau.in"},
  {id:"brinjalK",en:"Brinjal",gu:"રીંગણ",cat:"vegetable",season:"K",nB:75,nT1:75,nT2:0,nT3:0,pB:75,kB:75,sB:25,caB:20,mgB:15,micro:"FYM 25 t/ha",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"tomatoK",en:"Tomato (Kharif)",gu:"ટામેટું (ખરીફ)",cat:"vegetable",season:"K",nB:60,nT1:30,nT2:30,nT3:0,pB:75,kB:75,sB:25,caB:175,mgB:75,micro:"CaNO₃+B 0.2%",src:"AAU AGRESCO",link:"https://aau.in"},
  {id:"tomatoR",en:"Tomato (Rabi)",gu:"ટામેટું (રવિ)",cat:"vegetable",season:"R",nB:60,nT1:30,nT2:30,nT3:0,pB:75,kB:75,sB:25,caB:175,mgB:75,micro:"FYM 25 t/ha",src:"AAU AGRESCO",link:"https://aau.in"},
  {id:"tomatoS",en:"Tomato (Summer)",gu:"ટામેટું (ઉનાળુ)",cat:"vegetable",season:"S",nB:60,nT1:30,nT2:30,nT3:0,pB:75,kB:75,sB:25,caB:175,mgB:75,micro:"FYM 25 t/ha",src:"AAU AGRESCO",link:"https://aau.in"},
  {id:"chilliK",en:"Chilli (Kharif)",gu:"મરચું (ખરીફ)",cat:"vegetable",season:"K",nB:60,nT1:30,nT2:30,nT3:0,pB:60,kB:60,sB:25,caB:20,mgB:15,micro:"ZnSO₄ 0.5%",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"chilliR",en:"Chilli (Rabi)",gu:"મરચું (રવિ)",cat:"vegetable",season:"R",nB:60,nT1:30,nT2:30,nT3:0,pB:60,kB:60,sB:25,caB:20,mgB:15,micro:"FYM 20 t/ha",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"onionK",en:"Onion (Kharif)",gu:"ડુંગળી (ખરીફ)",cat:"vegetable",season:"K",nB:37.5,nT1:37.5,nT2:0,nT3:0,pB:50,kB:25,sB:30,caB:10,mgB:0,micro:"S 30; Zn 5; B 10",src:"JAU Veg RS",link:"https://jau.in"},
  {id:"onionR",en:"Onion (Rabi)",gu:"ડુંગળી (રવિ)",cat:"vegetable",season:"R",nB:50,nT1:50,nT2:0,nT3:0,pB:50,kB:50,sB:30,caB:10,mgB:0,micro:"S 30; Zn 10; B 10",src:"ICAR DOGR 2024",link:"https://dogr.icar.gov.in"},
  {id:"garlic",en:"Garlic",gu:"લસણ",cat:"vegetable",season:"R",nB:50,nT1:50,nT2:0,nT3:0,pB:50,kB:50,sB:30,caB:10,mgB:0,micro:"S 30; Zn 10; B 10",src:"ICAR DOGR 2024",link:"https://dogr.icar.gov.in"},
  {id:"potato",en:"Potato",gu:"બટાકા",cat:"vegetable",season:"R",nB:110,nT1:55,nT2:55,nT3:0,pB:110,kB:220,sB:25,caB:160,mgB:30,micro:"Mg 30; ZnSO₄ 25",src:"AAU",link:"https://aau.in"},
  {id:"cabbage",en:"Cabbage",gu:"કોબી",cat:"vegetable",season:"R",nB:75,nT1:37.5,nT2:37.5,nT3:0,pB:56,kB:56,sB:25,caB:20,mgB:15,micro:"B 10 kg/ha",src:"AAU AGRESCO",link:"https://aau.in"},
  {id:"cauliflower",en:"Cauliflower",gu:"ફૂલકોબી",cat:"vegetable",season:"R",nB:60,nT1:30,nT2:30,nT3:0,pB:60,kB:60,sB:25,caB:20,mgB:15,micro:"B 10-15 kg/ha",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"carrot",en:"Carrot",gu:"ગાજર",cat:"vegetable",season:"R",nB:37.5,nT1:37.5,nT2:0,nT3:0,pB:50,kB:50,sB:20,caB:10,mgB:0,micro:"B 10; ZnSO₄ 10",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"radish",en:"Radish",gu:"મૂળા",cat:"vegetable",season:"R",nB:60,nT1:0,nT2:0,nT3:0,pB:30,kB:30,sB:20,caB:0,mgB:0,micro:"S 20 kg/ha",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"beetroot",en:"Beetroot",gu:"બીટ",cat:"vegetable",season:"R",nB:75,nT1:0,nT2:0,nT3:0,pB:50,kB:75,sB:20,caB:10,mgB:0,micro:"B 10 kg/ha",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"palak",en:"Spinach (Palak)",gu:"પાલક",cat:"vegetable",season:"R",nB:50,nT1:50,nT2:0,nT3:0,pB:50,kB:50,sB:20,caB:10,mgB:15,micro:"Fe-EDTA foliar",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"pea",en:"Peas (Vegetable)",gu:"વટાણા",cat:"vegetable",season:"R",nB:20,nT1:0,nT2:0,nT3:0,pB:60,kB:40,sB:17.5,caB:10,mgB:0,micro:"Rhizobium",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"watermelon",en:"Watermelon",gu:"તરબૂચ",cat:"vegetable",season:"S",nB:50,nT1:50,nT2:0,nT3:0,pB:50,kB:50,sB:20,caB:10,mgB:15,micro:"FYM 20 t/ha",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"muskmelon",en:"Muskmelon",gu:"શક્કરટેટી",cat:"vegetable",season:"S",nB:50,nT1:50,nT2:0,nT3:0,pB:50,kB:50,sB:20,caB:10,mgB:15,micro:"FYM 20 t/ha",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"cucumber",en:"Cucumber",gu:"કાકડી",cat:"vegetable",season:"S",nB:50,nT1:50,nT2:0,nT3:0,pB:50,kB:50,sB:20,caB:10,mgB:15,micro:"FYM 20 t/ha",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"bottlegourd",en:"Bottle Gourd",gu:"દૂધી",cat:"vegetable",season:"S",nB:50,nT1:50,nT2:0,nT3:0,pB:50,kB:50,sB:20,caB:10,mgB:15,micro:"Borax 0.2%",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"bittergourd",en:"Bitter Gourd",gu:"કારેલું",cat:"vegetable",season:"S",nB:50,nT1:50,nT2:0,nT3:0,pB:50,kB:50,sB:20,caB:10,mgB:15,micro:"ZnSO₄ 5 kg/ha",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"ridgegourd",en:"Ridge Gourd",gu:"તુરિયા",cat:"vegetable",season:"K",nB:37.5,nT1:37.5,nT2:0,nT3:0,pB:37,kB:37,sB:20,caB:10,mgB:15,micro:"FYM 15 t/ha",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"mustard1",en:"Mustard (Rainfed)",gu:"રાઈ (બિનસિંચાઈ)",cat:"oilseed",season:"R",nB:60,nT1:0,nT2:0,nT3:0,pB:0,kB:0,sB:35,caB:15,mgB:0,kdef:20,micro:"Gypsum 200 kg/ha",src:"AAU Arnej",link:"https://aau.in"},
  {id:"mustard2",en:"Mustard (Irr)",gu:"રાઈ (સિંચાઈ)",cat:"oilseed",season:"R",nB:60,nT1:0,nT2:0,nT3:0,pB:20,kB:0,sB:35,caB:15,mgB:0,micro:"Borax 0.2%",src:"AAU Arnej",link:"https://aau.in"},
  {id:"sunflower",en:"Sunflower",gu:"સૂર્યમુખી",cat:"oilseed",season:"R",nB:40,nT1:40,nT2:0,nT3:0,pB:60,kB:40,sB:30,caB:15,mgB:0,micro:"S 10; B 2g/L",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"safflower",en:"Safflower",gu:"કરડી",cat:"oilseed",season:"R",nB:25,nT1:0,nT2:0,nT3:0,pB:0,kB:0,sB:20,caB:0,mgB:0,kdef:20,micro:"Gypsum 200 kg/ha",src:"AAU Arnej",link:"https://aau.in"},
  {id:"linseed",en:"Linseed",gu:"અળસી",cat:"oilseed",season:"R",nB:60,nT1:0,nT2:0,nT3:0,pB:30,kB:20,sB:20,caB:0,mgB:0,micro:"ZnSO₄ 10 kg/ha",src:"ICAR AICRP",link:"https://icar.org.in"},
  {id:"napier",en:"Hybrid Napier",gu:"હાઇબ્રિડ નેપિયર",cat:"fodder",season:"K",nB:50,nT1:50,nT2:50,nT3:50,pB:40,kB:80,sB:17.5,caB:10,mgB:15,micro:"FYM 20 t/ha",src:"ICAR IGFRI",link:"https://icar.org.in"},
  {id:"foddermaize",en:"Fodder Maize",gu:"મકાઈ (ચારો)",cat:"fodder",season:"K",nB:33.33,nT1:33.33,nT2:33.33,nT3:0,pB:50,kB:40,sB:17.5,caB:10,mgB:15,micro:"ZnSO₄ 25 kg/ha",src:"AAU AGRESCO",link:"https://aau.in"},
  {id:"foddersorghumRf",en:"Fodder Sorghum (Rf)",gu:"જુવાર (ચારો)",cat:"fodder",season:"K",nB:40,nT1:0,nT2:0,nT3:0,pB:10,kB:0,sB:20,caB:0,mgB:0,micro:"Gypsum 200 kg/ha",src:"AAU Arnej",link:"https://aau.in"},
  {id:"foddercowpea",en:"Fodder Cowpea",gu:"ચોળા (ચારો)",cat:"fodder",season:"K",nB:20,nT1:0,nT2:0,nT3:0,pB:40,kB:20,sB:17.5,caB:10,mgB:15,micro:"Rhizobium",src:"ICAR IGFRI",link:"https://icar.org.in"},
  {id:"lucerne",en:"Lucerne",gu:"લ્યુસર્ન",cat:"fodder",season:"R",nB:20,nT1:0,nT2:0,nT3:0,pB:80,kB:40,sB:17.5,caB:10,mgB:15,micro:"Rhizobium; FYM 20 t/ha",src:"ICAR IGFRI",link:"https://icar.org.in"},
  {id:"berseem",en:"Berseem",gu:"બરસીમ",cat:"fodder",season:"R",nB:20,nT1:0,nT2:0,nT3:0,pB:60,kB:40,sB:17.5,caB:10,mgB:15,micro:"Rhizobium",src:"ICAR IGFRI",link:"https://icar.org.in"},
  {id:"oat",en:"Oat Fodder",gu:"ઓટ (ચારો)",cat:"fodder",season:"R",nB:40,nT1:20,nT2:20,nT3:0,pB:40,kB:20,sB:17.5,caB:10,mgB:15,micro:"ZnSO₄ 25 kg/ha",src:"ICAR IGFRI",link:"https://icar.org.in"},
  {id:"banana",en:"Banana",gu:"કેળું",cat:"fruit",season:"K",perPlant:true,nB:200,pB:60,kB:200,sB:30,caB:50,mgB:87.5,micro:"ZnSO₄ 30 g/plant",src:"NAU + ICAR 2025",link:"https://nau.in",densityPresets:[800,1200,1600]},
  {id:"papaya",en:"Papaya",gu:"પપૈયું",cat:"fruit",season:"K",perPlant:true,nB:200,pB:200,kB:250,sB:30,caB:0,mgB:0,micro:"FYM 20 t/ha",src:"ICAR NHB",link:"https://nhb.gov.in",densityPresets:[800,1200,1600]},
  {id:"mango",en:"Mango (Bearing)",gu:"આંબો",cat:"fruit",season:"K",perPlant:true,nB:500,pB:250,kB:500,sB:30,caB:0,mgB:0,micro:"ZnSO₄+FeSO₄+B foliar",src:"ICAR NHB",link:"https://nhb.gov.in",densityPresets:[40,60,100]},
  {id:"pomegranate",en:"Pomegranate",gu:"દાડમ",cat:"fruit",season:"K",perPlant:true,nB:150,pB:75,kB:150,sB:30,caB:0,mgB:20,micro:"FeSO₄ 50g; B 10g",src:"ICAR NHB",link:"https://nhb.gov.in",densityPresets:[150,250,400]},
  {id:"guava",en:"Guava (Drip)",gu:"જામફળ",cat:"fruit",season:"K",perPlant:true,nB:375,pB:188,kB:188,sB:25,caB:20,mgB:20,micro:"FYM 50 kg/tree",src:"AAU 14th AGRESCO",link:"https://aau.in",densityPresets:[80,110,160]},
  {id:"lime",en:"Lime / Lemon",gu:"લીંબુ",cat:"fruit",season:"K",perPlant:true,nB:500,pB:250,kB:500,sB:30,caB:0,mgB:20,micro:"ZnSO₄ 50g/plant",src:"ICAR NHB",link:"https://nhb.gov.in",densityPresets:[100,150,250]},
  {id:"sapota",en:"Sapota (Chiku)",gu:"ચીકુ",cat:"fruit",season:"K",perPlant:true,nB:1000,pB:500,kB:500,sB:25,caB:20,mgB:20,micro:"FYM 50 kg/plant",src:"NAU + ICAR NHB",link:"https://nau.in",densityPresets:[40,60,100]},
  {id:"coconut",en:"Coconut",gu:"નાળિયેરી",cat:"fruit",season:"K",perPlant:true,nB:500,pB:320,kB:1200,sB:30,caB:0,mgB:500,micro:"Borax 160g/palm",src:"ICAR CPCRI 2025",link:"https://cpcri.gov.in",densityPresets:[50,70,90]},
  {id:"custardapple",en:"Custard Apple",gu:"સીતાફળ",cat:"fruit",season:"K",perPlant:true,nB:150,pB:75,kB:75,sB:25,caB:20,mgB:20,micro:"FYM 25 kg/plant",src:"ICAR NHB",link:"https://nhb.gov.in",densityPresets:[60,100,150]}
];

const FERTILIZERS = [
  {id:"neemurea",en:"Neem Coated Urea",gu:"લીમડા કોટેડ યુરિયા",fam:"Urea",n:46,p:0,k:0,s:0,ca:0,mg:0,bag:45},
  {id:"amsul",en:"Ammonium Sulphate",gu:"એમોનિયમ સલ્ફેટ",fam:"AmSul",n:20.6,p:0,k:0,s:23,ca:0,mg:0,bag:50},
  {id:"canitrate",en:"Calcium Nitrate",gu:"કેલ્શિયમ નાઈટ્રેટ",fam:"CaN",n:15.5,p:0,k:0,s:0,ca:26,mg:0,bag:50},
  {id:"dap",en:"DAP 18:46:0",gu:"ડીએપી 18:46:0",fam:"DAP",n:18,p:46,k:0,s:0,ca:0,mg:0,bag:50},
  {id:"ssp",en:"SSP 0:16:0",gu:"એસ.એસ.પી.",fam:"SSP",n:0,p:16,k:0,s:11,ca:21,mg:0,bag:50},
  {id:"tsp",en:"TSP 0:46:0",gu:"ટી.એસ.પી.",fam:"TSP",n:0,p:46,k:0,s:0,ca:0,mg:0,bag:50},
  {id:"mop",en:"MOP (Potash)",gu:"એમ.ઓ.પી.",fam:"MOP",n:0,p:0,k:60,s:0,ca:0,mg:0,bag:50},
  {id:"npk123216",en:"NPK 12:32:16",gu:"એન.પી.કે. 12:32:16",fam:"NPK",n:12,p:32,k:16,s:0,ca:0,mg:0,bag:50},
  {id:"npk2020013",en:"NPK 20:20:0:13",gu:"એન.પી.કે. 20:20:0:13",fam:"NPK",n:20,p:20,k:0,s:13,ca:0,mg:0,bag:50},
  {id:"npk202000",en:"NPK 20:20:0",gu:"એન.પી.કે. 20:20:0",fam:"NPK",n:20,p:20,k:0,s:0,ca:0,mg:0,bag:50},
  {id:"npk102626",en:"NPK 10:26:26",gu:"એન.પી.કે. 10:26:26",fam:"NPK",n:10,p:26,k:26,s:0,ca:0,mg:0,bag:50},
  {id:"sulphur90",en:"Sulphur 90%",gu:"સલ્ફર 90%",fam:"Sulphur",n:0,p:0,k:0,s:90,ca:0,mg:0,bag:50},
  {id:"mgso4",en:"Magnesium Sulphate",gu:"મેગ્નેશિયમ સલ્ફેટ",fam:"MgS",n:0,p:0,k:0,s:12.5,ca:0,mg:9.5,bag:50}
];

const COMPAT = {
  Urea:{Urea:"C",AmSul:"C",CaN:"X",DAP:"W",SSP:"C",TSP:"C",MOP:"C",NPK:"C",Sulphur:"C",MgS:"C"},
  AmSul:{Urea:"C",AmSul:"C",CaN:"X",DAP:"C",SSP:"C",TSP:"C",MOP:"C",NPK:"C",Sulphur:"C",MgS:"C"},
  CaN:{Urea:"X",AmSul:"X",CaN:"C",DAP:"X",SSP:"X",TSP:"X",MOP:"C",NPK:"X",Sulphur:"C",MgS:"X"},
  DAP:{Urea:"W",AmSul:"C",CaN:"X",DAP:"C",SSP:"C",TSP:"C",MOP:"C",NPK:"C",Sulphur:"C",MgS:"C"},
  SSP:{Urea:"C",AmSul:"C",CaN:"X",DAP:"C",SSP:"C",TSP:"C",MOP:"C",NPK:"C",Sulphur:"C",MgS:"C"},
  TSP:{Urea:"C",AmSul:"C",CaN:"X",DAP:"C",SSP:"C",TSP:"C",MOP:"C",NPK:"C",Sulphur:"C",MgS:"C"},
  MOP:{Urea:"C",AmSul:"C",CaN:"C",DAP:"C",SSP:"C",TSP:"C",MOP:"C",NPK:"C",Sulphur:"C",MgS:"C"},
  NPK:{Urea:"C",AmSul:"C",CaN:"X",DAP:"C",SSP:"C",TSP:"C",MOP:"C",NPK:"C",Sulphur:"C",MgS:"C"},
  Sulphur:{Urea:"C",AmSul:"C",CaN:"C",DAP:"C",SSP:"C",TSP:"C",MOP:"C",NPK:"C",Sulphur:"C",MgS:"C"},
  MgS:{Urea:"C",AmSul:"C",CaN:"X",DAP:"C",SSP:"C",TSP:"C",MOP:"C",NPK:"C",Sulphur:"C",MgS:"C"}
};

const UNITS=[
  {id:"acre",en:"Acre",gu:"એકર",f:0.4047},
  {id:"ha",en:"Hectare",gu:"હેક્ટર",f:1},
  {id:"vigha24",en:"Vigha (24 Guntha)",gu:"વીઘા (24 ગુંઠા)",f:0.2428},
  {id:"vigha16",en:"Vigha (16 Guntha)",gu:"વીઘા (16 ગુંઠા)",f:0.1619},
  {id:"guntha",en:"Guntha",gu:"ગુંઠા",f:0.0101},
  {id:"bigha",en:"Bigha",gu:"બીઘા",f:0.1619},
  {id:"cent",en:"Cent",gu:"સેન્ટ",f:0.00405},
  {id:"sqm",en:"Sq Meter",gu:"ચોરસ મીટર",f:0.0001}
];

const CATS={
  cereal:{en:"Cereals & Millets",gu:"ધાન્ય અને બાજરી"},
  pulse:{en:"Pulses",gu:"કઠોળ"},
  oilseed:{en:"Oilseeds",gu:"તેલીબિયાં"},
  cash:{en:"Cash Crops",gu:"રોકડિયા પાક"},
  fodder:{en:"Fodder Crops",gu:"ઘાસચારો પાક"},
  vegetable:{en:"Vegetables",gu:"શાકભાજી"},
  spice:{en:"Spices",gu:"મસાલા"},
  fruit:{en:"Fruits & Plantation",gu:"ફળઝાડ"}
};

const SEAS={K:{en:"Kharif",gu:"ખરીફ"},R:{en:"Rabi",gu:"રવિ"},S:{en:"Summer",gu:"ઉનાળુ"}};

const fmt=(n)=>!isFinite(n)?"0":Number(n).toLocaleString("en-IN",{maximumFractionDigits:1});

function isCompat(combo){
  for(let i=0;i<combo.length;i++){
    for(let j=i+1;j<combo.length;j++){
      const row=COMPAT[combo[i].fam];
      const r=row?(row[combo[j].fam]||"C"):"C";
      if(r==="X")return false;
    }
  }
  return true;
}

function evalBagPlan(combo,bags,targets){
  const sup={N:0,P:0,K:0,S:0,Ca:0,Mg:0};
  let totalBags=0,usedProducts=0;
  for(let i=0;i<combo.length;i++){
    if(bags[i]===0)continue;
    usedProducts++;
    totalBags+=bags[i];
    const qty=bags[i]*(combo[i].bag||50);
    sup.N+=qty*(combo[i].n||0)/100;
    sup.P+=qty*(combo[i].p||0)/100;
    sup.K+=qty*(combo[i].k||0)/100;
    sup.S+=qty*(combo[i].s||0)/100;
    sup.Ca+=qty*(combo[i].ca||0)/100;
    sup.Mg+=qty*(combo[i].mg||0)/100;
  }
  if(usedProducts===0)return null;
  const keys=["N","P","K","S","Ca","Mg"];
  let penalty=0;
  for(const key of keys){
    const tg=targets[key]||0;
    const wt=(key==="N"||key==="P"||key==="K")?100:30;
    if(tg<=0.5){
      if(sup[key]>15)penalty+=(sup[key]-15)*2;
    }else{
      const ratio=sup[key]/tg;
      if(ratio<1)penalty+=(1-ratio)*wt*2.5;
      else penalty+=(ratio-1)*wt*1.0;
    }
  }
  const score=-totalBags*4-penalty-usedProducts*15;
  return {score,sup,totalBags,usedProducts};
}

function findBestBagPlan(targetsPerHa,pool,areaHa){
  const t={
    N:(targetsPerHa.N||0)*areaHa,
    P:(targetsPerHa.P||0)*areaHa,
    K:(targetsPerHa.K||0)*areaHa,
    S:(targetsPerHa.S||0)*areaHa,
    Ca:(targetsPerHa.Ca||0)*areaHa,
    Mg:(targetsPerHa.Mg||0)*areaHa
  };
  const MAX_BAGS=8,MAX_PRODUCTS=3;
  let best=null,bestScore=-Infinity;

  function tryCombo(combo){
    const n=combo.length;
    const bags=new Array(n).fill(0);
    function enumBags(idx){
      if(idx===n){
        const r=evalBagPlan(combo,bags,t);
        if(r&&r.score>bestScore){bestScore=r.score;best={combo:combo.slice(),bags:bags.slice(),result:r};}
        return;
      }
      for(let b=0;b<=MAX_BAGS;b++){bags[idx]=b;enumBags(idx+1);}
    }
    enumBags(0);
  }

  function genCombos(start,cur,size){
    if(cur.length===size){
      if(!isCompat(cur))return;
      tryCombo(cur);
      return;
    }
    for(let i=start;i<pool.length;i++){
      cur.push(pool[i]);
      genCombos(i+1,cur,size);
      cur.pop();
    }
  }

  for(let sz=2;sz<=Math.min(MAX_PRODUCTS,pool.length);sz++){
    genCombos(0,[],sz);
  }

  if(!best){
    for(let i=0;i<pool.length;i++){
      if(bestScore>-99999)break;
      tryCombo([pool[i]]);
    }
  }

  return best;
}

function computeBagsForSelection(selected,targetsPerHa,areaHa){
  if(!selected.length)return {bags:{},supply:{N:0,P:0,K:0,S:0,Ca:0,Mg:0}};
  const t={
    N:(targetsPerHa.N||0)*areaHa,
    P:(targetsPerHa.P||0)*areaHa,
    K:(targetsPerHa.K||0)*areaHa,
    S:(targetsPerHa.S||0)*areaHa,
    Ca:(targetsPerHa.Ca||0)*areaHa,
    Mg:(targetsPerHa.Mg||0)*areaHa
  };
  const n=selected.length;
  const cap=n>=5?6:8;
  let bestBags=null,bestScore=-Infinity;
  const scoreOf=(arr)=>{const r=evalBagPlan(selected,arr,t);return r?r.score:-Infinity;};

  if(n<=4){
    const bags=new Array(n).fill(0);
    (function enumBags(idx){
      if(idx===n){
        const s=scoreOf(bags);
        if(s>bestScore){bestScore=s;bestBags=bags.slice();}
        return;
      }
      for(let b=0;b<=cap;b++){bags[idx]=b;enumBags(idx+1);}
    })(0);
  }else{
    // Greedy build + local refinement: fast and stays responsive for many products
    const cur=new Array(n).fill(0);
    bestScore=scoreOf(cur);
    bestBags=cur.slice();
    let improving=true;
    while(improving){
      improving=false;
      let pick=-1,pickScore=bestScore;
      for(let i=0;i<n;i++){
        if(cur[i]>=cap)continue;
        cur[i]++;
        const s=scoreOf(cur);
        cur[i]--;
        if(s>pickScore){pickScore=s;pick=i;}
      }
      if(pick>=0){cur[pick]++;bestScore=pickScore;bestBags=cur.slice();improving=true;}
    }
    for(let pass=0;pass<3;pass++){
      let changed=false;
      for(let i=0;i<n;i++){
        for(const d of [1,-1]){
          const v=cur[i]+d;
          if(v<0||v>cap)continue;
          const prev=cur[i];
          cur[i]=v;
          const s=scoreOf(cur);
          if(s>bestScore){bestScore=s;bestBags=cur.slice();changed=true;}
          else cur[i]=prev;
        }
      }
      if(!changed)break;
    }
  }
  const result={},totalSup={N:0,P:0,K:0,S:0,Ca:0,Mg:0};
  if(bestBags){
    for(let i=0;i<n;i++){
      if(bestBags[i]>0){
        result[selected[i].id]=bestBags[i];
        const qty=bestBags[i]*(selected[i].bag||50);
        totalSup.N+=qty*(selected[i].n||0)/100;
        totalSup.P+=qty*(selected[i].p||0)/100;
        totalSup.K+=qty*(selected[i].k||0)/100;
        totalSup.S+=qty*(selected[i].s||0)/100;
        totalSup.Ca+=qty*(selected[i].ca||0)/100;
        totalSup.Mg+=qty*(selected[i].mg||0)/100;
      }
    }
  }
  return {bags:result,supply:totalSup};
}

export default function FertilizerCalculator(){
  const [lang,setLang]=useState("gu");
  const [cropId,setCropId]=useState("");
  const [areaInput,setAreaInput]=useState("1");
  const [unitId,setUnitId]=useState("acre");
  const [stage,setStage]=useState("basal");
  const [plantsPerAcre,setPlantsPerAcre]=useState("");
  const [densityPreset,setDensityPreset]=useState(1);
  const [selFerts,setSelFerts]=useState([]);
  const [bagPlan,setBagPlan]=useState({});
  const [autoPicked,setAutoPicked]=useState(false);
  const [showNPK,setShowNPK]=useState(false);
  const [fertSearch,setFertSearch]=useState("");
  const [cropSearch,setCropSearch]=useState("");
  const [cropOpen,setCropOpen]=useState(false);
  const [customMode,setCustomMode]=useState(false);
  const [customN,setCustomN]=useState("");
  const [customP,setCustomP]=useState("");
  const [customK,setCustomK]=useState("");
  const [customS,setCustomS]=useState("");
  const [customCa,setCustomCa]=useState("");
  const [customMg,setCustomMg]=useState("");
  const [kdef,setKdef]=useState(false);
  const [shopMode,setShopMode]=useState(false);
  const [shopStock,setShopStock]=useState([]);
  const [shopOpen,setShopOpen]=useState(false);
  const [sec,setSec]=useState({crop:true,area:true,dens:true,stage:true});
  const ddRef=useRef(null);

  const toggleSec=(k)=>setSec(p=>({...p,[k]:!p[k]}));

  const TT={
    en:{title:"🌱 Fertilizer Calculator",sub:"ICAR + Gujarat Agri Universities",
      s1:"Select Crop",s2:"Area & Unit",s25:"Plant Density",s4:"Stage",s5:"Nutrient Values",s6:"Select Fertilizers",
      basal:"Basal",top1:"Top1",top2:"Top2",top3:"Top3",
      search:"Search crop…",noRes:"No crops",area:"Area",unit:"Unit",eq:"Equivalent",
      densP:["Low","Medium","High"],
      kdefNote:"Gujarat soils often K-deficient",kdef:"My soil is K-deficient",
      rec:"Recommended",custom:"Custom",changeNPK:"✏️ Edit nutrients",resetNPK:"↩️ Reset",
      showNPK:"👁 Show values",hideNPK:"👁 Hide values",
      searchF:"Search fertilizer…",selAll:"All",resetF:"Reset",autoBest:"✨ Auto-best",
      shopToggle:"🏪 Shop Stock Mode",shopTitle:"Shop Stock",shopHint:"Tick what your shop stocks — best mix picked automatically",
      shopBest:"Best Mix from Your Stock",shopOrder:"Order",shopClose:"Done",shopEmpty:"No stock",
      results:"📋 Recommended Products (Bag-wise)",forArea:"for area",perPlant:"per plant",
      bag:"Bags",kg:"kg",g:"g",total:"Total",tgt:"Need",sup:"Gives",st:"Status",
      met:"✅ Met",short:"⚠️ Low",over:"⚠️ Excess",
      allMet:"✅ All nutrients met — best bag combination",notMet:"⚠️ Some nutrients off-target",
      compatHard:"🚫 Cannot apply together",compatSoft:"⚠️ Apply at different times",
      compatOk:"✅ All selected fertilizers are compatible",
      micro:"🌿 Micronutrient Advisory",tips:"💡 Application Tips",src:"Source",
      made:"Made for Gujarat farmers",chooseCrop:"Choose crop",
      bestPick:"✨ Best bag-wise combination auto-selected",
      primary:"Primary (N-P-K)",secondary:"Secondary (S-Ca-Mg)",
      basalNote:"Urea & Ammonium Sulphate reserved for Top dressing (ICAR)",
      modifyNutrients:"Modify any nutrient value manually",
      nShortNote:"N shortage will be covered at Top dressing stage"},
    gu:{title:"🌱 ખાતર ગણતરી",sub:"ICAR + ગુજરાત કૃષિ યુનિવર્સિટી",
      s1:"પાક પસંદ કરો",s2:"ક્ષેત્ર અને એકમ",s25:"વૃક્ષ ઘનતા",s4:"તબક્કો",s5:"પોષક મૂલ્યો",s6:"ખાતર પસંદ કરો",
      basal:"પાયાનું",top1:"ટોપ ૧",top2:"ટોપ ૨",top3:"ટોપ ૩",
      search:"પાક શોધો…",noRes:"કોઈ પાક મળ્યો નથી",area:"ક્ષેત્ર",unit:"એકમ",eq:"સમાન",
      densP:["ઓછી","મધ્યમ","વધુ"],
      kdefNote:"ગુજરાતની જમીનમાં K-ઘટ સામાન્ય",kdef:"મારી જમીનમાં K ની ઘટ છે",
      rec:"ભલામણ",custom:"કસ્ટમ",changeNPK:"✏️ પોષક બદલો",resetNPK:"↩️ રીસેટ",
      showNPK:"👁 મૂલ્યો જુઓ",hideNPK:"👁 મૂલ્યો છુપાવો",
      searchF:"ખાતર શોધો…",selAll:"બધા",resetF:"રીસેટ",autoBest:"✨ શ્રેષ્ઠ",
      shopToggle:"🏪 દુકાન સ્ટોક મોડ",shopTitle:"દુકાન સ્ટોક",shopHint:"તમારી દુકાનમાં શું છે તે પસંદ કરો — શ્રેષ્ઠ મિશ્રણ સૂચવાશે",
      shopBest:"તમારા સ્ટોકમાંથી શ્રેષ્ઠ મિશ્રણ",shopOrder:"ઓર્ડર",shopClose:"થઈ ગયું",shopEmpty:"કોઈ સ્ટોક નથી",
      results:"📋 ભલામણ કરેલ ઉત્પાદનો (ગુણ પ્રમાણે)",forArea:"ક્ષેત્ર માટે",perPlant:"પ્રતિ વૃક્ષ",
      bag:"ગુણ",kg:"કિલો",g:"ગ્રામ",total:"કુલ",tgt:"જરૂરી",sup:"મળે",st:"સ્થિતિ",
      met:"✅ પૂર્ણ",short:"⚠️ ઓછું",over:"⚠️ વધારે",
      allMet:"✅ બધા પોષક પૂર્ણ — શ્રેષ્ઠ ગુણ સંયોજન",notMet:"⚠️ કેટલાક પોષક લક્ષ્યથી દૂર",
      compatHard:"🚫 એકસાથે અરજ ન કરો",compatSoft:"⚠️ અલગ-અલગ સમયે અરજ કરો",
      compatOk:"✅ બધા ખાતર સુસંગત છે",
      micro:"🌿 સૂક્ષ્મ પોષક સલાહ",tips:"💡 અરજ ટિપ્સ",src:"સ્રોત",
      made:"ગુજરાતના ખેડૂતો માટે",chooseCrop:"પાક પસંદ કરો",
      bestPick:"✨ શ્રેષ્ઠ ગુણ-વાર સંયોજન આપોઆપ પસંદ કરેલ",
      primary:"મુખ્ય (N-P-K)",secondary:"ગૌણ (S-Ca-Mg)",
      basalNote:"ICAR પ્રથા મુજબ યુરિયા અને એમોનિયમ સલ્ફેટ ફક્ત ટોપ ડ્રેસિંગ માટે",
      modifyNutrients:"કોઈપણ પોષક મૂલ્ય જાતે બદલો",
      nShortNote:"N ની ઘટ ટોપ ડ્રેસિંગ તબક્કે પૂરી થશે"}
  };
  const t=TT[lang];

  const crop=CROPS.find(c=>c.id===cropId)||null;
  const isPP=crop&&crop.perPlant;
  const unit=UNITS.find(u=>u.id===unitId)||UNITS[0];
  const area=parseFloat(areaInput)||0;
  const areaHa=area*unit.f;

  useEffect(()=>{
    if(!cropOpen)return;
    const clk=(e)=>{if(ddRef.current&&!ddRef.current.contains(e.target))setCropOpen(false);};
    const key=(e)=>{if(e.key==="Escape")setCropOpen(false);};
    document.addEventListener("mousedown",clk);
    document.addEventListener("keydown",key);
    return ()=>{document.removeEventListener("mousedown",clk);document.removeEventListener("keydown",key);};
  },[cropOpen]);

  useEffect(()=>{
    if(isPP&&crop&&crop.densityPresets){setDensityPreset(1);setPlantsPerAcre(String(crop.densityPresets[1]));}
    else setPlantsPerAcre("");
  },[cropId,isPP,crop]);

  useEffect(()=>{
    setCustomMode(false);setCustomN("");setCustomP("");setCustomK("");setCustomS("");setCustomCa("");setCustomMg("");
    setKdef(false);setAutoPicked(false);setSelFerts([]);setBagPlan({});setShowNPK(false);
    if(cropId)setSec(p=>({...p,crop:false}));
  },[cropId,stage]);

  const filteredCrops=useMemo(()=>{
    const q=cropSearch.trim().toLowerCase();
    if(!q)return CROPS;
    const raw=cropSearch.trim();
    return CROPS.filter(c=>c.en.toLowerCase().includes(q)||c.gu.includes(raw)||c.id.toLowerCase().includes(q)||(CATS[c.cat]&&(CATS[c.cat].en.toLowerCase().includes(q)||CATS[c.cat].gu.includes(raw))));
  },[cropSearch]);

  const groupedCrops=useMemo(()=>{
    const g={};
    filteredCrops.forEach(c=>{if(!g[c.cat])g[c.cat]=[];g[c.cat].push(c);});
    return g;
  },[filteredCrops]);

  const availStages=useMemo(()=>{
    if(!crop)return [];
    const s=["basal"];
    if(!isPP){
      if(crop.nT1>0)s.push("top1");
      if(crop.nT2>0)s.push("top2");
      if(crop.nT3>0)s.push("top3");
    }
    return s;
  },[crop,isPP]);

  useEffect(()=>{if(crop&&!availStages.includes(stage))setStage(availStages[0]||"basal");},[crop,availStages,stage]);

  const visibleFerts=useMemo(()=>{
    if(!crop)return [];
    if(stage==="basal")return FERTILIZERS.filter(f=>f.id!=="neemurea"&&f.id!=="amsul");
    return FERTILIZERS.filter(f=>f.p===0&&f.k===0);
  },[stage,crop]);

  const plantsPerHa=isPP&&parseFloat(plantsPerAcre)>0?parseFloat(plantsPerAcre)/0.4047:0;

  let recN=0,recP=0,recK=0,recS=0,recCa=0,recMg=0;
  if(crop){
    if(isPP){
      if(plantsPerHa>0){recN=crop.nB*plantsPerHa/1000;recP=crop.pB*plantsPerHa/1000;recK=crop.kB*plantsPerHa/1000;}
      recS=crop.sB||0;recCa=crop.caB||0;recMg=crop.mgB||0;
    }else if(stage==="basal"){
      recN=crop.nB;recP=crop.pB;recK=crop.kB+(kdef&&crop.kdef?crop.kdef:0);
      recS=crop.sB||0;recCa=crop.caB||0;recMg=crop.mgB||0;
    }else if(stage==="top1"){recN=crop.nT1;}
    else if(stage==="top2"){recN=crop.nT2;}
    else if(stage==="top3"){recN=crop.nT3;}
  }

  const tNperHa=customMode&&customN!==""?(parseFloat(customN)||0):recN;
  const tPperHa=customMode&&customP!==""?(parseFloat(customP)||0):recP;
  const tKperHa=customMode&&customK!==""?(parseFloat(customK)||0):recK;
  const tSperHa=customMode&&customS!==""?(parseFloat(customS)||0):recS;
  const tCaperHa=customMode&&customCa!==""?(parseFloat(customCa)||0):recCa;
  const tMgperHa=customMode&&customMg!==""?(parseFloat(customMg)||0):recMg;

  const targetsPerHa={N:tNperHa,P:tPperHa,K:tKperHa,S:tSperHa,Ca:tCaperHa,Mg:tMgperHa};
  const shopStockKey=shopStock.join(",");
  const selFertsKey=selFerts.join(",");

  useEffect(()=>{
    if(!crop||!visibleFerts.length)return;
    let pool=visibleFerts;
    if(shopMode){
      const inStock=visibleFerts.filter(f=>shopStock.includes(f.id));
      if(inStock.length>0)pool=inStock;
    }
    if(!pool.length){setSelFerts([]);setBagPlan({});setAutoPicked(true);return;}
    const best=findBestBagPlan(targetsPerHa,pool,areaHa);
    if(best){
      const ids=[];
      for(let i=0;i<best.combo.length;i++){if(best.bags[i]>0)ids.push(best.combo[i].id);}
      setSelFerts(ids);
      const bp={};
      for(let i=0;i<best.combo.length;i++){if(best.bags[i]>0)bp[best.combo[i].id]=best.bags[i];}
      setBagPlan(bp);
    }
    setAutoPicked(true);
  },[cropId,stage,isPP,plantsPerAcre,shopMode,shopStockKey,areaHa,tNperHa,tPperHa,tKperHa,tSperHa,tCaperHa,tMgperHa]);

  useEffect(()=>{
    if(!crop||!selFerts.length){if(selFerts.length===0)setBagPlan({});return;}
    const selected=FERTILIZERS.filter(f=>selFerts.includes(f.id));
    if(!selected.length)return;
    const r=computeBagsForSelection(selected,targetsPerHa,areaHa);
    setBagPlan(r.bags);
  },[selFertsKey,areaHa,tNperHa,tPperHa,tKperHa,tSperHa,tCaperHa,tMgperHa]);

  const selFertsList=FERTILIZERS.filter(f=>selFerts.includes(f.id));

  const sup={N:0,P:0,K:0,S:0,Ca:0,Mg:0};
  let totalBags=0;
  const bagDetails=[];
  selFertsList.forEach(f=>{
    const bagCount=bagPlan[f.id]||0;
    if(bagCount<=0)return;
    const qty=bagCount*(f.bag||50);
    totalBags+=bagCount;
    const sn=qty*(f.n||0)/100,sp=qty*(f.p||0)/100,sk=qty*(f.k||0)/100;
    const ss=qty*(f.s||0)/100,sca=qty*(f.ca||0)/100,smg=qty*(f.mg||0)/100;
    sup.N+=sn;sup.P+=sp;sup.K+=sk;sup.S+=ss;sup.Ca+=sca;sup.Mg+=smg;
    const role=sp>0?"P":sk>0?"K":sn>0?"N":ss>0?"S":smg>0?"Mg":"Ca";
    bagDetails.push({f,bags:bagCount,kg:qty,sn,sp,sk,ss,sca,smg,role});
  });

  const compatIssues=[];
  for(let i=0;i<selFertsList.length;i++){
    for(let j=i+1;j<selFertsList.length;j++){
      const a=selFertsList[i],b=selFertsList[j];
      if((bagPlan[a.id]||0)<=0||(bagPlan[b.id]||0)<=0)continue;
      const row=COMPAT[a.fam];
      const r=row?(row[b.fam]||"C"):"C";
      if(r==="X")compatIssues.push({a:a[lang]||a.en,b:b[lang]||b.en,level:"X"});
      else if(r==="W")compatIssues.push({a:a[lang]||a.en,b:b[lang]||b.en,level:"W"});
    }
  }
  const hardIssues=compatIssues.filter(x=>x.level==="X");
  const softIssues=compatIssues.filter(x=>x.level==="W");

  const targetN=tNperHa*areaHa,targetP=tPperHa*areaHa,targetK=tKperHa*areaHa;
  const targetS=tSperHa*areaHa,targetCa=tCaperHa*areaHa,targetMg=tMgperHa*areaHa;

  const TOL=0.05;
  const status=(tg,sp)=>{
    if(tg<=0.5&&sp<=1)return "ok";
    if(tg<=0.5&&sp>1)return "over";
    const r=sp/tg;
    if(r>=0.75&&r<=1.30)return "ok";
    return r<0.75?"short":"over";
  };
  const statN=status(targetN,sup.N),statP=status(targetP,sup.P),statK=status(targetK,sup.K);
  const statS=recS>0?status(targetS,sup.S):"na";
  const statCa=recCa>0?status(targetCa,sup.Ca):"na";
  const statMg=recMg>0?status(targetMg,sup.Mg):"na";
  const allOk=totalBags>0&&hardIssues.length===0&&statP!=="short"&&statK!=="short"&&statS!=="short"&&statCa!=="short"&&statMg!=="short";

  const filteredFerts=useMemo(()=>{
    const q=fertSearch.trim().toLowerCase();
    if(!q)return visibleFerts;
    const raw=fertSearch.trim();
    return visibleFerts.filter(f=>f.en.toLowerCase().includes(q)||f.gu.includes(raw));
  },[visibleFerts,fertSearch]);

  const toggleF=(id)=>setSelFerts(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const toggleShop=(id)=>setShopStock(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const reAutoPick=()=>{
    if(!crop)return;
    let pool=visibleFerts;
    if(shopMode){
      const inStock=visibleFerts.filter(f=>shopStock.includes(f.id));
      if(inStock.length>0)pool=inStock;
    }
    if(!pool.length){setSelFerts([]);setBagPlan({});return;}
    const best=findBestBagPlan(targetsPerHa,pool,areaHa);
    if(best){
      const ids=[];
      for(let i=0;i<best.combo.length;i++){if(best.bags[i]>0)ids.push(best.combo[i].id);}
      setSelFerts(ids);
      const bp={};
      for(let i=0;i<best.combo.length;i++){if(best.bags[i]>0)bp[best.combo[i].id]=best.bags[i];}
      setBagPlan(bp);
    }
  };

  const S="bg-white rounded-2xl shadow-sm border border-emerald-100";
  const I="w-full border-2 border-emerald-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:border-emerald-500 bg-white";
  const BTN=(on)=>"py-3 px-2 rounded-xl text-sm font-bold border-2 "+(on?"bg-emerald-600 text-white border-emerald-600":"bg-white text-emerald-800 border-emerald-200");
  const statColor=(s)=>s==="ok"?"bg-green-100 text-green-800":s==="short"?"bg-red-100 text-red-800":s==="na"?"bg-gray-100 text-gray-400":"bg-amber-100 text-amber-800";
  const statLbl=(s)=>s==="ok"?t.met:s==="short"?t.short:s==="na"?"—":t.over;
  const roleColor=(r)=>r==="P"?"bg-blue-100 text-blue-800":r==="K"?"bg-purple-100 text-purple-800":r==="S"?"bg-amber-100 text-amber-800":r==="Mg"?"bg-teal-100 text-teal-800":r==="Ca"?"bg-pink-100 text-pink-800":"bg-green-100 text-green-800";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-lime-50">
      <div className="max-w-2xl mx-auto px-3 py-5 space-y-4">
        <header className="text-center px-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-900">{t.title}</h1>
          <p className="text-xs text-emerald-700 mt-1">{t.sub}</p>
          <div className="mt-3 inline-flex gap-1 p-1 bg-white rounded-full border border-emerald-200">
            <button onClick={()=>setLang("en")} className={"px-4 py-1.5 rounded-full text-sm font-semibold "+(lang==="en"?"bg-emerald-600 text-white":"text-emerald-700")}>English</button>
            <button onClick={()=>setLang("gu")} className={"px-4 py-1.5 rounded-full text-sm font-semibold "+(lang==="gu"?"bg-emerald-600 text-white":"text-emerald-700")}>ગુજરાતી</button>
          </div>
        </header>

        {/* STEP 1: CROP */}
        <section className={S}>
          <button type="button" onClick={()=>toggleSec("crop")} className="w-full flex items-center justify-between py-3 px-4">
            <span className="text-sm font-bold text-emerald-800 uppercase tracking-wide">1. {t.s1}</span>
            <span className="text-emerald-600 font-bold text-lg">{sec.crop?"−":"+"}</span>
          </button>
          {sec.crop&&(
            <div className="px-4 pb-4">
              <div className="relative" ref={ddRef}>
                <button type="button" onClick={()=>setCropOpen(!cropOpen)} className="w-full text-left border-2 border-emerald-200 rounded-xl px-3 py-3 bg-white flex items-center justify-between" style={{minHeight:48}}>
                  <span className={crop?"font-semibold text-emerald-900":"text-gray-500"}>{crop?(crop[lang]||crop.en):"-- "+t.chooseCrop+" --"}</span>
                  <span className="text-emerald-600 font-bold">{cropOpen?"▲":"▼"}</span>
                </button>
                {cropOpen&&(
                  <div className="absolute z-30 left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-emerald-200" style={{maxHeight:"70vh",display:"flex",flexDirection:"column"}}>
                    <div className="p-3 border-b border-emerald-100 bg-emerald-50">
                      <input type="text" value={cropSearch} onChange={e=>setCropSearch(e.target.value)} placeholder={t.search} className="w-full border-2 border-emerald-200 rounded-xl px-3 py-2.5 text-sm bg-white" style={{minHeight:44}} autoFocus/>
                      <div className="text-xs text-emerald-700 mt-1.5 text-right font-semibold">{filteredCrops.length} {lang==="gu"?"પાક":"crops"}</div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {filteredCrops.length===0?<div className="text-center py-10 text-gray-400 text-sm">{t.noRes}</div>:
                        Object.keys(groupedCrops).map(cat=>(
                          <div key={cat}>
                            <div className="px-3 py-2 text-xs font-bold uppercase text-emerald-700 bg-emerald-50 sticky top-0 border-y border-emerald-100">{CATS[cat][lang]}</div>
                            {groupedCrops[cat].map(c=>(
                              <button key={c.id} type="button" onClick={()=>{setCropId(c.id);setCropOpen(false);setCropSearch("");}} className={"w-full text-left px-3 py-3 border-b border-gray-100 flex items-center justify-between "+(c.id===cropId?"bg-emerald-50":"")} style={{minHeight:52}}>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-bold text-gray-900">{c[lang]||c.en}</div>
                                  <div className="text-xs text-gray-500">{SEAS[c.season][lang]}</div>
                                </div>
                                {c.id===cropId&&<span className="text-emerald-600 text-lg">✓</span>}
                              </button>
                            ))}
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* STEP 2: AREA */}
        <section className={S}>
          <button type="button" onClick={()=>toggleSec("area")} className="w-full flex items-center justify-between py-3 px-4">
            <span className="text-sm font-bold text-emerald-800 uppercase tracking-wide">2. {t.s2}</span>
            <span className="text-emerald-600 font-bold text-lg">{sec.area?"−":"+"}</span>
          </button>
          {sec.area&&(
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.area}</label>
                  <input type="number" value={areaInput} onChange={e=>setAreaInput(e.target.value)} className={I} style={{minHeight:48}}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.unit}</label>
                  <select value={unitId} onChange={e=>setUnitId(e.target.value)} className={I} style={{minHeight:48}}>
                    {UNITS.map(u=><option key={u.id} value={u.id}>{u[lang]||u.en}</option>)}
                  </select>
                </div>
              </div>
              {areaHa>0&&<p className="mt-2 text-xs text-emerald-700">{t.eq}: <b>{areaHa.toFixed(4)} ha</b></p>}
            </div>
          )}
        </section>

        {/* STEP 2.5: DENSITY */}
        {isPP&&crop&&crop.densityPresets&&(
          <section className={S}>
            <button type="button" onClick={()=>toggleSec("dens")} className="w-full flex items-center justify-between py-3 px-4">
              <span className="text-sm font-bold text-emerald-800 uppercase tracking-wide">2.5. {t.s25}</span>
              <span className="text-emerald-600 font-bold text-lg">{sec.dens?"−":"+"}</span>
            </button>
            {sec.dens&&(
              <div className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {crop.densityPresets.map((v,i)=>(
                    <button key={i} type="button" onClick={()=>{setDensityPreset(i);setPlantsPerAcre(String(v));}} className={BTN(densityPreset===i)} style={{minHeight:48}}>
                      {t.densP[i]}
                      <div className="text-xs opacity-75">{v}</div>
                    </button>
                  ))}
                </div>
                <input type="number" value={plantsPerAcre} onChange={e=>{setPlantsPerAcre(e.target.value);setDensityPreset(-1);}} className={I} style={{minHeight:48}}/>
              </div>
            )}
          </section>
        )}

        {/* STEP 4: STAGE */}
        {crop&&availStages.length>0&&(
          <section className={S}>
            <button type="button" onClick={()=>toggleSec("stage")} className="w-full flex items-center justify-between py-3 px-4">
              <span className="text-sm font-bold text-emerald-800 uppercase tracking-wide">4. {t.s4}</span>
              <span className="text-emerald-600 font-bold text-lg">{sec.stage?"−":"+"}</span>
            </button>
            {sec.stage&&(
              <div className="px-4 pb-4">
                <div className="grid gap-2" style={{gridTemplateColumns:"repeat("+Math.min(availStages.length,4)+",1fr)"}}>
                  {availStages.map(s=>(
                    <button key={s} type="button" onClick={()=>setStage(s)} className={BTN(stage===s)} style={{minHeight:48}}>{t[s]||s}</button>
                  ))}
                </div>
                {stage==="basal"&&<div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-800">ℹ️ {t.basalNote}</div>}
              </div>
            )}
          </section>
        )}

        {/* STEP 5: NPK */}
        {crop&&(
          <section className={S}>
            <div className="flex items-center justify-between py-3 px-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-emerald-800 uppercase">5. {t.s5}</h2>
                <span className={"text-xs font-bold px-2 py-0.5 rounded-full "+(customMode?"bg-amber-100 text-amber-800":"bg-emerald-100 text-emerald-800")}>{customMode?t.custom:t.rec}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setShowNPK(!showNPK)} className="px-3 py-1.5 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">{showNPK?t.hideNPK:t.showNPK}</button>
                {!customMode?(
                  <button onClick={()=>{setCustomN(String(recN));setCustomP(String(recP));setCustomK(String(recK));setCustomS(String(recS));setCustomCa(String(recCa));setCustomMg(String(recMg));setCustomMode(true);setShowNPK(true);}} className="px-3 py-1.5 text-xs rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-semibold">{t.changeNPK}</button>
                ):(
                  <button onClick={()=>{setCustomMode(false);setCustomN("");setCustomP("");setCustomK("");setCustomS("");setCustomCa("");setCustomMg("");}} className="px-3 py-1.5 text-xs rounded-lg bg-gray-50 text-gray-700 border border-gray-200 font-semibold">{t.resetNPK}</button>
                )}
              </div>
            </div>
            {showNPK&&(
              <div className="px-4 pb-4">
                {!customMode?(
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-bold text-emerald-700 uppercase mb-2">{t.primary}</div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100"><div className="text-xs text-emerald-700 font-semibold">N</div><div className="text-lg font-extrabold text-emerald-900">{fmt(recN)}</div><div className="text-xs text-emerald-600">{t.kg}/ha</div></div>
                        <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100"><div className="text-xs text-blue-700 font-semibold">P</div><div className="text-lg font-extrabold text-blue-900">{fmt(recP)}</div><div className="text-xs text-blue-600">{t.kg}/ha</div></div>
                        <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100"><div className="text-xs text-purple-700 font-semibold">K</div><div className="text-lg font-extrabold text-purple-900">{fmt(recK)}</div><div className="text-xs text-purple-600">{t.kg}/ha</div></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-700 uppercase mb-2">{t.secondary}</div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100"><div className="text-xs text-amber-700 font-semibold">S</div><div className="text-lg font-extrabold text-amber-900">{fmt(recS)}</div><div className="text-xs text-amber-600">{t.kg}/ha</div></div>
                        <div className="bg-pink-50 rounded-xl p-3 text-center border border-pink-100"><div className="text-xs text-pink-700 font-semibold">Ca</div><div className="text-lg font-extrabold text-pink-900">{fmt(recCa)}</div><div className="text-xs text-pink-600">{t.kg}/ha</div></div>
                        <div className="bg-teal-50 rounded-xl p-3 text-center border border-teal-100"><div className="text-xs text-teal-700 font-semibold">Mg</div><div className="text-lg font-extrabold text-teal-900">{fmt(recMg)}</div><div className="text-xs text-teal-600">{t.kg}/ha</div></div>
                      </div>
                    </div>
                  </div>
                ):(
                  <div>
                    <p className="text-xs text-gray-600 mb-3 bg-amber-50 border border-amber-200 rounded-lg p-2">{t.modifyNutrients}</p>
                    <div className="text-xs font-bold text-emerald-700 uppercase mb-2">{t.primary}</div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div><label className="block text-xs font-bold text-emerald-800 mb-1">N</label><input type="number" value={customN} onChange={e=>setCustomN(e.target.value)} className="w-full border-2 border-emerald-300 rounded-xl px-2 py-2.5 font-bold text-center" style={{minHeight:48}}/></div>
                      <div><label className="block text-xs font-bold text-blue-800 mb-1">P</label><input type="number" value={customP} onChange={e=>setCustomP(e.target.value)} className="w-full border-2 border-blue-300 rounded-xl px-2 py-2.5 font-bold text-center" style={{minHeight:48}}/></div>
                      <div><label className="block text-xs font-bold text-purple-800 mb-1">K</label><input type="number" value={customK} onChange={e=>setCustomK(e.target.value)} className="w-full border-2 border-purple-300 rounded-xl px-2 py-2.5 font-bold text-center" style={{minHeight:48}}/></div>
                    </div>
                    <div className="text-xs font-bold text-amber-700 uppercase mb-2">{t.secondary}</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div><label className="block text-xs font-bold text-amber-800 mb-1">S</label><input type="number" value={customS} onChange={e=>setCustomS(e.target.value)} className="w-full border-2 border-amber-300 rounded-xl px-2 py-2.5 font-bold text-center" style={{minHeight:48}}/></div>
                      <div><label className="block text-xs font-bold text-pink-800 mb-1">Ca</label><input type="number" value={customCa} onChange={e=>setCustomCa(e.target.value)} className="w-full border-2 border-pink-300 rounded-xl px-2 py-2.5 font-bold text-center" style={{minHeight:48}}/></div>
                      <div><label className="block text-xs font-bold text-teal-800 mb-1">Mg</label><input type="number" value={customMg} onChange={e=>setCustomMg(e.target.value)} className="w-full border-2 border-teal-300 rounded-xl px-2 py-2.5 font-bold text-center" style={{minHeight:48}}/></div>
                    </div>
                  </div>
                )}
                {crop.kdef&&stage==="basal"&&!customMode&&(
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800 mb-2">{t.kdefNote}</p>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={kdef} onChange={e=>setKdef(e.target.checked)} className="w-5 h-5"/>
                      <span className="text-sm font-semibold text-amber-900">{t.kdef}</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* STEP 6: FERTILIZERS */}
        {crop&&visibleFerts.length>0&&(
          <section className={S}>
            <div className="flex items-center justify-between py-3 px-4 flex-wrap gap-2">
              <h2 className="text-sm font-bold text-emerald-800 uppercase">6. {t.s6}</h2>
              <button type="button" onClick={()=>setShopMode(!shopMode)} className={"px-3 py-1.5 text-xs rounded-lg border-2 font-semibold "+(shopMode?"bg-amber-100 text-amber-800 border-amber-400":"bg-white text-gray-700 border-gray-300")}>{t.shopToggle}</button>
            </div>
            <div className="px-4 pb-4">
              {shopMode&&(
                <div className="mb-3 bg-amber-50 border-2 border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-800 mb-2">{t.shopHint}</p>
                  <button type="button" onClick={()=>setShopOpen(true)} className="w-full bg-white border-2 border-amber-400 rounded-xl px-3 py-2.5 text-sm font-bold text-amber-800" style={{minHeight:44}}>🏪 {t.shopTitle} ({shopStock.length})</button>
                </div>
              )}
              {!shopMode&&(
                <div>
                  <div className="flex justify-end gap-2 mb-2 flex-wrap">
                    <button onClick={reAutoPick} className="px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold">{t.autoBest}</button>
                    <button onClick={()=>setSelFerts(visibleFerts.map(f=>f.id))} className="px-3 py-1.5 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">{t.selAll}</button>
                    <button onClick={()=>{setSelFerts([]);setBagPlan({});}} className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200 font-semibold">{t.resetF}</button>
                  </div>
                  <input type="text" value={fertSearch} onChange={e=>setFertSearch(e.target.value)} placeholder={t.searchF} className={I+" mb-3 text-sm"} style={{minHeight:44}}/>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredFerts.map(f=>{
                      const on=selFerts.includes(f.id);
                      let line="N "+f.n+" · P "+f.p+" · K "+f.k;
                      if(f.s)line+=" · S "+f.s;
                      if(f.ca)line+=" · Ca "+f.ca;
                      if(f.mg)line+=" · Mg "+f.mg;
                      return (
                        <button key={f.id} onClick={()=>toggleF(f.id)} className={"flex items-center gap-3 px-3 py-3 rounded-xl border-2 text-left "+(on?"bg-emerald-50 border-emerald-500":"bg-white border-gray-200")} style={{minHeight:56}}>
                          <div className={"w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 "+(on?"bg-emerald-600 border-emerald-600":"bg-white border-gray-300")}>{on&&<span className="text-white font-bold">✓</span>}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-900">{f[lang]||f.en}</div>
                            <div className="text-xs text-gray-500">{line}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* RESULTS */}
        {crop&&bagDetails.length>0&&(
          <section className={S}>
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className="text-base font-bold text-emerald-900">{shopMode?t.shopBest:t.results}</h2>
                {autoPicked&&(
                  <button onClick={reAutoPick} className="px-2 py-1 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold">✨ {lang==="gu"?"ફરી શ્રેષ્ઠ":"Reset best"}</button>
                )}
              </div>
              {autoPicked&&(
                <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-800">✨ {t.bestPick} — {totalBags} {t.bag} {lang==="gu"?"કુલ":"total"}</div>
              )}

              <div className="space-y-2 mb-4">
                {bagDetails.map((m,i)=>{
                  const inStock=!shopMode||shopStock.includes(m.f.id);
                  return (
                    <div key={i} className={"border-2 rounded-xl p-3 "+(inStock?"border-emerald-100 bg-emerald-50":"border-amber-400 bg-amber-50")}>
                      <div className="flex justify-between gap-2 mb-2 flex-wrap">
                        <div className="text-sm font-bold text-emerald-900">{m.f[lang]||m.f.en}</div>
                        <div className="flex gap-1">
                          {!inStock&&<span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">🛒 {t.shopOrder}</span>}
                          <span className={"text-xs font-bold px-2 py-0.5 rounded-full "+roleColor(m.role)}>{m.role}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-white rounded-lg p-2 border border-emerald-100">
                          <div className="text-xs text-gray-500">{t.bag}</div>
                          <div className="font-extrabold text-emerald-800 text-lg">{m.bags} {t.bag}</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-emerald-100">
                          <div className="text-xs text-gray-500">{t.total}</div>
                          <div className="font-bold text-emerald-700">{fmt(m.kg)} {t.kg}</div>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-6 gap-1 text-xs">
                        {[
                          {l:"N",v:m.sn,c:"text-emerald-700"},
                          {l:"P",v:m.sp,c:"text-blue-700"},
                          {l:"K",v:m.sk,c:"text-purple-700"},
                          {l:"S",v:m.ss,c:"text-amber-700"},
                          {l:"Ca",v:m.sca,c:"text-pink-700"},
                          {l:"Mg",v:m.smg,c:"text-teal-700"}
                        ].map(nx=>{
                          if(nx.v<=0.01)return null;
                          return (
                            <div key={nx.l} className="bg-white rounded p-1 text-center border border-gray-100">
                              <div className={"text-[10px] font-bold "+nx.c}>{nx.l}</div>
                              <div className="font-bold text-xs">{fmt(nx.v)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {stage==="basal"&&statN==="short"&&(
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
                  <div className="text-xs text-blue-800">ℹ️ <b>N {t.short}: {fmt(targetN-sup.N)} {t.kg}</b> — {t.nShortNote}</div>
                </div>
              )}

              {hardIssues.length>0&&(
                <div className="bg-red-50 border-2 border-red-400 rounded-xl p-3 mb-3">
                  <div className="text-sm font-bold text-red-800 mb-2">{t.compatHard}</div>
                  {hardIssues.map((iss,i)=>(
                    <div key={i} className="text-xs text-red-700 mb-2 bg-white rounded-lg p-2 border border-red-200"><b>❌ {iss.a} + {iss.b}</b></div>
                  ))}
                </div>
              )}

              {softIssues.length>0&&(
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3 mb-3">
                  <div className="text-sm font-bold text-amber-800 mb-2">{t.compatSoft}</div>
                  {softIssues.map((iss,i)=>(
                    <div key={i} className="text-xs text-amber-700 mb-2 bg-white rounded-lg p-2 border border-amber-200"><b>⚠️ {iss.a} + {iss.b}</b></div>
                  ))}
                </div>
              )}

              {hardIssues.length===0&&softIssues.length===0&&bagDetails.length>1&&(
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-3 mb-3 text-sm font-semibold text-green-800 text-center">{t.compatOk}</div>
              )}

              <div className="border border-emerald-100 rounded-xl overflow-hidden mb-3">
                <table className="w-full text-sm">
                  <thead className="bg-emerald-600 text-white">
                    <tr><th className="text-left px-3 py-2">—</th><th className="text-right px-3 py-2">{t.tgt}</th><th className="text-right px-3 py-2">{t.sup}</th><th className="text-center px-3 py-2">{t.st}</th></tr>
                  </thead>
                  <tbody className="bg-white">
                    {[
                      {l:"N",tg:targetN,sp:sup.N,s:statN},
                      {l:"P",tg:targetP,sp:sup.P,s:statP},
                      {l:"K",tg:targetK,sp:sup.K,s:statK},
                      {l:"S",tg:targetS,sp:sup.S,s:statS},
                      {l:"Ca",tg:targetCa,sp:sup.Ca,s:statCa},
                      {l:"Mg",tg:targetMg,sp:sup.Mg,s:statMg}
                    ].map(r=>(
                      <tr key={r.l} className="border-t border-emerald-50">
                        <td className="px-3 py-2 font-bold">{r.l}</td>
                        <td className="px-3 py-2 text-right">{r.tg>0?fmt(r.tg)+" "+t.kg:"—"}</td>
                        <td className="px-3 py-2 text-right">{r.sp>0?fmt(r.sp)+" "+t.kg:"—"}</td>
                        <td className="px-3 py-2 text-center"><span className={"inline-block px-2 py-0.5 rounded-full text-xs font-bold "+statColor(r.s)}>{statLbl(r.s)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={"rounded-xl p-3 border mb-3 "+(allOk?"bg-green-50 border-green-200":"bg-amber-50 border-amber-200")}>
                <div className={"text-sm font-bold "+(allOk?"text-green-700":"text-amber-700")}>{allOk?t.allMet:t.notMet}</div>
              </div>

              {crop.micro&&(
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3">
                  <div className="text-xs font-bold text-emerald-800 mb-1">{t.micro}</div>
                  <div className="text-xs text-emerald-700">{crop.micro}</div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                <div className="text-xs font-bold text-amber-800 mb-1">{t.tips}</div>
                <ul className="text-xs text-amber-700 space-y-1">
                  {stage==="basal"&&<li>• {lang==="gu"?"ખાતર જમીનમાં સારી રીતે મિક્સ કરો.":"Mix fertilizers thoroughly in soil."}</li>}
                  {stage==="basal"&&<li>• {lang==="gu"?"જમીન ભેજવાળી હોય તો અરજ પછી પાણી આપો.":"Irrigate after application if soil is dry."}</li>}
                  <li>• {lang==="gu"?"Urea અને DAP એક ડોલમાં મિક્સ ન કરો.":"Do not mix Urea + DAP in same bucket."}</li>
                  {crop.kdef&&<li>• {lang==="gu"?"SHC મુજબ MOP ઉમેરો.":"Add MOP as per SHC."}</li>}
                  {crop.sB>0&&<li>• {lang==="gu"?"S માટે Sulphur 90% આપો.":"For S, use Sulphur 90%."}</li>}
                  {crop.mgB>0&&<li>• {lang==="gu"?"Mg માટે MgSO₄ આપો.":"For Mg, use MgSO₄."}</li>}
                </ul>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span>{t.src}: {crop.src}</span>
                {crop.link&&(<a href={crop.link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline font-semibold">🔗 {lang==="gu"?"જુઓ":"Open"}</a>)}
              </div>
            </div>
          </section>
        )}

        {!crop&&<div className="text-center text-sm text-gray-500 py-6">{t.chooseCrop}</div>}
        <footer className="text-center text-xs text-emerald-800 py-4">🌾 {t.made}</footer>
      </div>

      {shopOpen&&(
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{backgroundColor:"rgba(6,46,26,0.45)"}} onClick={()=>setShopOpen(false)}>
          <div className="w-full bg-white flex flex-col rounded-t-3xl" style={{maxWidth:540,maxHeight:"85vh"}} onClick={e=>e.stopPropagation()}>
            <div className="p-4 border-b border-amber-100 flex justify-between items-center">
              <div>
                <div className="font-bold text-amber-900">🏪 {t.shopTitle}</div>
                <div className="text-xs text-amber-700">{shopStock.length} {lang==="gu"?"પસંદ":"selected"}</div>
              </div>
              <button onClick={()=>setShopOpen(false)} className="w-11 h-11 rounded-full text-gray-500" style={{minHeight:44,minWidth:44}}>✕</button>
            </div>
            <div className="overflow-y-auto flex-1 p-3">
              {visibleFerts.length===0?<div className="text-center py-10 text-gray-400 text-sm">{t.shopEmpty}</div>:
                visibleFerts.map(f=>{
                  const on=shopStock.includes(f.id);
                  let line="N "+f.n+" · P "+f.p+" · K "+f.k;
                  if(f.s)line+=" · S "+f.s;
                  if(f.ca)line+=" · Ca "+f.ca;
                  if(f.mg)line+=" · Mg "+f.mg;
                  return (
                    <button key={f.id} onClick={()=>toggleShop(f.id)} className={"w-full flex items-center gap-3 px-3 py-3 mb-2 rounded-xl border-2 text-left "+(on?"bg-amber-50 border-amber-500":"bg-white border-gray-200")} style={{minHeight:56}}>
                      <div className={"w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 "+(on?"bg-amber-600 border-amber-600":"bg-white border-gray-300")}>{on&&<span className="text-white font-bold">✓</span>}</div>
                      <div className="flex-1"><div className="text-sm font-bold">{f[lang]||f.en}</div><div className="text-xs text-gray-500">{line}</div></div>
                    </button>
                  );
                })
              }
            </div>
            <div className="p-4 border-t">
              <button onClick={()=>setShopOpen(false)} className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold" style={{minHeight:48}}>{t.shopClose}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

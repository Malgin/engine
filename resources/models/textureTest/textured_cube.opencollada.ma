//Maya ASCII 2017 scene
requires maya "2017";
currentUnit -l centimeter -a degree -t film;
createNode script -n "upAxisScriptNode";
	setAttr ".b" -type "string" "string $currentAxis = `upAxis -q -ax`; if ($currentAxis != \"y\") { upAxis -ax \"y\"; viewSet -home persp; }";
	setAttr ".st" 2;
createNode transform -n "pCube2";
	addAttr -ln "colladaId" -dt "string";
	setAttr .colladaId -type "string" "_pCube2";
	setAttr ".t" -type "double3" 1.552985 0.221520 -0.443668;
	setAttr ".r" -type "double3" 44.149581 18.130718 18.985821;
createNode transform -n "pCube1";
	addAttr -ln "colladaId" -dt "string";
	setAttr .colladaId -type "string" "_pCube1";
	setAttr ".t" -type "double3" 0.000000 0.000000 0.000000;
	setAttr ".r" -type "double3" 0.000000 -0.000000 0.000000;
createNode phong -n "blinn1";
	setAttr ".dc" 1.000000;
	setAttr ".cp" 2.000000;
	addAttr -ln "colladaEffectId" -dt "string";
	setAttr .colladaEffectId -type "string" "blinn1-fx";
	addAttr -ln "colladaMaterialId" -dt "string";
	setAttr .colladaMaterialId -type "string" "blinn1";
createNode shadingEngine -n "blinn1SG";
createNode materialInfo -n "materialInfo_1";
createNode place2dTexture -n "place2dTexture_1";
createNode phong -n "cubemat2";
	setAttr ".dc" 1.000000;
	setAttr ".rfl" 0.242647;
	setAttr ".sc" -type "float3" 0.172500 0.500000 0.249293;
	setAttr ".cp" 68.294121;
	addAttr -ln "colladaEffectId" -dt "string";
	setAttr .colladaEffectId -type "string" "cubemat2-fx";
	addAttr -ln "colladaMaterialId" -dt "string";
	setAttr .colladaMaterialId -type "string" "cubemat2";
createNode shadingEngine -n "cubemat2SG";
createNode materialInfo -n "materialInfo_2";
createNode place2dTexture -n "place2dTexture_2";
createNode file -n "pasted__file6";
	setAttr ".ftn" -type "string" "./bricks.jpg";
	addAttr -ln "colladaId" -dt "string";
	setAttr .colladaId -type "string" "pasted__file6";
createNode file -n "file4";
	setAttr ".ftn" -type "string" "./stones.jpg";
	addAttr -ln "colladaId" -dt "string";
	setAttr .colladaId -type "string" "file4";
createNode mesh -n "pCube2Shape" -p "|pCube2";
	addAttr -ln "colladaId" -dt "string";
	setAttr .colladaId -type "string" "pCube2Shape";
	setAttr ".vt[0:7]" -0.500000 -0.500000 0.500000 0.500000 -0.500000 0.500000 -0.500000 0.500000 0.500000 0.500000 0.500000 0.500000 -0.500000 0.500000 -0.500000 0.500000 0.500000 -0.500000 -0.500000 -0.500000 -0.500000 0.500000 -0.500000 -0.500000;
	setAttr ".n[0:35]" 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000;
	setAttr ".usz" 1.000000;
	setAttr ".uvst[0].uvsn" -type "string" "pCube2Shape-map1";
	setAttr ".cuvs" -type "string" "pCube2Shape-map1";
	setAttr ".uvst[0].uvsp[0:13]" 0.059147 -1.263412 0.940853 -1.263412 0.059147 -0.381706 0.940853 -0.381706 0.059147 0.500000 0.940853 0.500000 0.059147 1.381706 0.940853 1.381706 0.059147 2.263412 0.940853 2.263412 1.822559 -1.263412 1.822559 -0.381706 -0.822559 -1.263412 -0.822559 -0.381706;
	setAttr ".ed[0:17]" 2 3 0 0 2 0 0 3 0 0 1 0 1 3 0 3 5 0 2 5 0 4 5 0 2 4 0 6 7 0 4 6 0 4 7 0 5 7 0 0 6 0 1 6 0 1 7 0 1 5 0 2 6 0;
	setAttr ".fc[0:11]" -type "polyFaces"  
		f 3 -1 -2 2
		mu 0 3 3 2 0 
		f 3 -3 3 4
		mu 0 3 3 0 1 
		f 3 5 -7 0
		mu 0 3 3 5 2 
		f 3 6 -8 -9
		mu 0 3 2 5 4 
		f 3 -10 -11 11
		mu 0 3 7 6 4 
		f 3 -12 7 12
		mu 0 3 7 4 5 
		f 3 -4 13 -15
		mu 0 3 9 8 6 
		f 3 14 9 -16
		mu 0 3 9 6 7 
		f 3 -5 16 -6
		mu 0 3 3 1 11 
		f 3 15 -13 -17
		mu 0 3 1 10 11 
		f 3 17 -14 1
		mu 0 3 2 12 0 
		f 3 -18 8 10
		mu 0 3 12 2 13;
createNode mesh -n "pCube1Shape" -p "|pCube1";
	addAttr -ln "colladaId" -dt "string";
	setAttr .colladaId -type "string" "pCube1Shape";
	setAttr ".vt[0:7]" -0.500000 -0.500000 0.500000 0.500000 -0.500000 0.500000 -0.500000 0.500000 0.500000 0.500000 0.500000 0.500000 -0.500000 0.500000 -0.500000 0.500000 0.500000 -0.500000 -0.500000 -0.500000 -0.500000 0.500000 -0.500000 -0.500000;
	setAttr ".n[0:35]" 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000 -1.000000 0.000000 0.000000;
	setAttr ".usz" 1.000000;
	setAttr ".uvst[0].uvsn" -type "string" "pCube1Shape-map1";
	setAttr ".cuvs" -type "string" "pCube1Shape-map1";
	setAttr ".uvst[0].uvsp[0:13]" 0.375000 0.000000 0.625000 0.000000 0.375000 0.250000 0.625000 0.250000 0.375000 0.500000 0.625000 0.500000 0.375000 0.750000 0.625000 0.750000 0.375000 1.000000 0.625000 1.000000 0.875000 0.000000 0.875000 0.250000 0.125000 0.000000 0.125000 0.250000;
	setAttr ".ed[0:17]" 2 3 0 0 2 0 0 3 0 0 1 0 1 3 0 3 5 0 2 5 0 4 5 0 2 4 0 6 7 0 4 6 0 4 7 0 5 7 0 0 6 0 1 6 0 1 7 0 1 5 0 2 6 0;
	setAttr ".fc[0:11]" -type "polyFaces"  
		f 3 -1 -2 2
		mu 0 3 3 2 0 
		f 3 -3 3 4
		mu 0 3 3 0 1 
		f 3 5 -7 0
		mu 0 3 3 5 2 
		f 3 6 -8 -9
		mu 0 3 2 5 4 
		f 3 -10 -11 11
		mu 0 3 7 6 4 
		f 3 -12 7 12
		mu 0 3 7 4 5 
		f 3 -4 13 -15
		mu 0 3 9 8 6 
		f 3 14 9 -16
		mu 0 3 9 6 7 
		f 3 -5 16 -6
		mu 0 3 3 1 11 
		f 3 15 -13 -17
		mu 0 3 1 10 11 
		f 3 17 -14 1
		mu 0 3 2 12 0 
		f 3 -18 8 10
		mu 0 3 12 2 13;
connectAttr "blinn1SG.msg" "materialInfo_1.sg";
connectAttr "blinn1SG.pa" ":renderPartition.st" -na;
connectAttr "blinn1.oc" "blinn1SG.ss";
connectAttr "blinn1.msg" "materialInfo_1.m";
connectAttr "cubemat2SG.msg" "materialInfo_2.sg";
connectAttr "cubemat2SG.pa" ":renderPartition.st" -na;
connectAttr "cubemat2.oc" "cubemat2SG.ss";
connectAttr "cubemat2.msg" "materialInfo_2.m";
connectAttr "|pCube2|pCube2Shape.iog" "blinn1SG.dsm" -na;
connectAttr "|pCube1|pCube1Shape.iog" "cubemat2SG.dsm" -na;
connectAttr "blinn1.msg" ":defaultShaderList1.s" -na;
connectAttr "cubemat2.msg" ":defaultShaderList1.s" -na;
connectAttr "defaultLightSet.msg" "lightLinker1.lnk[0].llnk";
connectAttr "blinn1SG.msg" "lightLinker1.lnk[0].olnk";
connectAttr "defaultLightSet.msg" "lightLinker1.slnk[0].sllk";
connectAttr "blinn1SG.msg" "lightLinker1.slnk[0].solk";
connectAttr "defaultLightSet.msg" "lightLinker1.lnk[1].llnk";
connectAttr "cubemat2SG.msg" "lightLinker1.lnk[1].olnk";
connectAttr "defaultLightSet.msg" "lightLinker1.slnk[1].sllk";
connectAttr "cubemat2SG.msg" "lightLinker1.slnk[1].solk";
connectAttr "defaultLightSet.msg" "lightLinker1.lnk[2].llnk";
connectAttr ":initialShadingGroup.msg" "lightLinker1.lnk[2].olnk";
connectAttr "defaultLightSet.msg" "lightLinker1.slnk[2].sllk";
connectAttr ":initialShadingGroup.msg" "lightLinker1.slnk[2].solk";
connectAttr "lightLinker1.msg" ":lightList1.ln[0]";
connectAttr "place2dTexture_1.o" "pasted__file6.uv";
connectAttr "place2dTexture_1.ofs" "pasted__file6.fs";
connectAttr "place2dTexture_1.vt1" "pasted__file6.vt1";
connectAttr "place2dTexture_1.vt2" "pasted__file6.vt2";
connectAttr "place2dTexture_1.vt3" "pasted__file6.vt3";
connectAttr "place2dTexture_1.vc1" "pasted__file6.vc1";
connectAttr "place2dTexture_1.of" "pasted__file6.of";
connectAttr "place2dTexture_1.s" "pasted__file6.s";
connectAttr "place2dTexture_1.c" "pasted__file6.c";
connectAttr "place2dTexture_1.tf" "pasted__file6.tf";
connectAttr "place2dTexture_1.mu" "pasted__file6.mu";
connectAttr "place2dTexture_1.mv" "pasted__file6.mv";
connectAttr "place2dTexture_1.wu" "pasted__file6.wu";
connectAttr "place2dTexture_1.wv" "pasted__file6.wv";
connectAttr "place2dTexture_1.n" "pasted__file6.n";
connectAttr "place2dTexture_1.r" "pasted__file6.ro";
connectAttr "place2dTexture_1.re" "pasted__file6.re";
connectAttr "place2dTexture_2.o" "file4.uv";
connectAttr "place2dTexture_2.ofs" "file4.fs";
connectAttr "place2dTexture_2.vt1" "file4.vt1";
connectAttr "place2dTexture_2.vt2" "file4.vt2";
connectAttr "place2dTexture_2.vt3" "file4.vt3";
connectAttr "place2dTexture_2.vc1" "file4.vc1";
connectAttr "place2dTexture_2.of" "file4.of";
connectAttr "place2dTexture_2.s" "file4.s";
connectAttr "place2dTexture_2.c" "file4.c";
connectAttr "place2dTexture_2.tf" "file4.tf";
connectAttr "place2dTexture_2.mu" "file4.mu";
connectAttr "place2dTexture_2.mv" "file4.mv";
connectAttr "place2dTexture_2.wu" "file4.wu";
connectAttr "place2dTexture_2.wv" "file4.wv";
connectAttr "place2dTexture_2.n" "file4.n";
connectAttr "place2dTexture_2.r" "file4.ro";
connectAttr "place2dTexture_2.re" "file4.re";
connectAttr "pasted__file6.msg" ":defaultTextureList1.tx" -na;
connectAttr "pasted__file6.oc" "blinn1.c";
connectAttr "pasted__file6.msg" "materialInfo_1.t" -na;
connectAttr "file4.msg" ":defaultTextureList1.tx" -na;
connectAttr "file4.oc" "cubemat2.c";
connectAttr "file4.msg" "materialInfo_2.t" -na;

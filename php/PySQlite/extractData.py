# -*- coding: utf-8 -*-
import sqlite3
import pprint
import networkx as nx

import sys
reload(sys)
sys.setdefaultencoding('utf-8')

class extract:

    def __init__(self,q):
        self.query=q
        self.connection=sqlite3.connect('../community.db')
	self.connection.row_factory = sqlite3.Row# Magic line!
        self.cursor=self.connection.cursor()
	self.scholars = {}
	self.scholars_colors = {}
	self.terms_colors = {}
	self.Graph = nx.DiGraph()
	self.min_num_friends=0


    def jaccard(self,occ1,occ2,cooc):
	if occ1==0 or occ2==0:
		return 0
	else:
		return cooc*cooc/float(occ1*occ2)


    def extract(self):
        try:
	    sql1="SELECT keywords_ids FROM scholars where unique_id='"+self.query+"'"
            self.cursor.execute(sql1)
            res1=self.cursor.fetchone()
            while res1 is not None:
                keywords_ids = res1['keywords_ids'].split(',')

		scholar_array = {}
		for keywords_id in keywords_ids:
			sql2 = "SELECT * FROM scholars2terms where term_id="+keywords_id
			try:
				self.cursor.execute(sql2)
				res2=self.cursor.fetchone()
				while res2 is not None:
					scholar_array[res2['scholar']]=1
					res2=self.cursor.fetchone()#res2++
			except Exception as error:
				print "sql2:\t"+sql2
				print error

		res1 = self.cursor.fetchone()#res1++


        except Exception as error:
		print "sql1:\t"+sql1
		print error

	
	for scholar_id in scholar_array:
		sql3="SELECT * FROM scholars where unique_id='"+scholar_id+"'"
		try:
			self.cursor.execute(sql3)
			res3=self.cursor.fetchall()
			n=len(res3)#in the DB, there are unique_ids duplicated
			info = {};
			#With (n-1) we're fetching only the last result.
			ide="D::"+str(res3[n-1]['id']);
			info['id'] = ide;	
			info['unique_id'] = res3[n-1]['unique_id'];
			info['photo_url'] = res3[n-1]['photo_url'];
			info['first_name'] = res3[n-1]['first_name'];
			info['initials'] = res3[n-1]['initials'];
			info['last_name'] = res3[n-1]['last_name'];
			info['nb_keywords'] = res3[n-1]['nb_keywords'];
			info['css_voter'] = res3[n-1]['css_voter'];
			info['css_member'] = res3[n-1]['css_member'];
			info['keywords_ids'] = res3[n-1]['keywords_ids'].split(',');
			info['keywords'] = res3[n-1]['keywords'];
			info['country'] = res3[n-1]['country'];
			info['homepage'] = res3[n-1]['homepage'];
			info['lab'] = res3[n-1]['lab'];
			info['affiliation'] = res3[n-1]['affiliation'];
			info['lab2'] = res3[n-1]['lab2'];
			info['affiliation2'] = res3[n-1]['affiliation2'];
			info['homepage'] = res3[n-1]['homepage'];
			info['title'] = res3[n-1]['title'];
			info['position'] = res3[n-1]['position'];
			info['job_market'] = res3[n-1]['job_market'];
			info['login'] = res3[n-1]['login'];
			self.scholars[ide] = info;

		except Exception as error:
			print "sql3:\t"+sql3
			print error


	# génère le gexf
	# include('gexf_generator.php');
	imsize=80;
	termsMatrix = {};
	scholarsMatrix = {};
	scholarsIncluded = 0;

	for i in self.scholars:
		self.scholars_colors[self.scholars[i]['login'].strip()]=0;
		scholar_keywords = self.scholars[i]['keywords_ids'];
		for k in range(len(scholar_keywords)):
			if scholar_keywords[k] != None and scholar_keywords[k]!="":
				#print scholar_keywords[k]
				if termsMatrix.has_key(scholar_keywords[k]):
					termsMatrix[scholar_keywords[k]]['occ'] = termsMatrix[scholar_keywords[k]]['occ'] + 1

					for l in range(len(scholar_keywords)):
						if termsMatrix[scholar_keywords[k]]['cooc'].has_key(scholar_keywords[l]):
							termsMatrix[scholar_keywords[k]]['cooc'][scholar_keywords[l]] += 1
						else:
							termsMatrix[scholar_keywords[k]]['cooc'][scholar_keywords[l]] = 1;
					
				else:
					termsMatrix[scholar_keywords[k]]={}
					termsMatrix[scholar_keywords[k]]['occ'] = 1;
					termsMatrix[scholar_keywords[k]]['cooc'] = {};
					for l in range(len(scholar_keywords)):
						if termsMatrix[scholar_keywords[k]]['cooc'].has_key(scholar_keywords[l]):
							termsMatrix[scholar_keywords[k]]['cooc'][scholar_keywords[l]] += 1
						else:
							termsMatrix[scholar_keywords[k]]['cooc'][scholar_keywords[l]] = 1;
	sql='select login from jobs';
	for res in self.cursor.execute(sql):
		if res['login'].strip() in self.scholars_colors:
			self.scholars_colors[res['login'].strip()]+=1;

	terms_array = {}
	sql="SELECT term,id,occurrences FROM terms"
	#self.cursor.execute(sql)
	cont=0
	for t in termsMatrix:
		if cont==0: 
			sql+=' where id='+t
			cont+=1
		else: sql+=' or id='+t
		
	for res in self.cursor.execute(sql):
		idT = res['id'] 	
		info = {}
		info['id'] = idT
		info['occurrences'] = res['occurrences']
		info['term'] = res['term']
		terms_array[idT] = info
	
	count=1
	
	for term in terms_array:
		self.terms_colors[term]=0

	sql='select term_id from jobs2terms'
	for row in self.cursor.execute(sql):
		if row['term_id'] in self.terms_colors:
			self.terms_colors[row['term_id']]+=1



	cont=0
	for term in terms_array:
		#sql="SELECT scholar FROM scholars2terms where term_id='"+str(term)+"'";
		sql="SELECT scholars.id FROM scholars,scholars2terms where term_id='"+str(term)+"' and scholars.unique_id=scholars2terms.scholar"
		term_scholars=[]
		for row in self.cursor.execute(sql):
			term_scholars.append("D::"+str(row['id']))

		for k in range(len(term_scholars)):
			if scholarsMatrix.has_key(term_scholars[k]):
				scholarsMatrix[term_scholars[k]]['occ'] = scholarsMatrix[term_scholars[k]]['occ'] + 1
				for l in range(len(term_scholars)):
					if self.scholars.has_key(term_scholars[l]):
						if scholarsMatrix[term_scholars[k]]['cooc'].has_key(term_scholars[l]):
							scholarsMatrix[term_scholars[k]]['cooc'][term_scholars[l]] += 1
						else:
							scholarsMatrix[term_scholars[k]]['cooc'][term_scholars[l]] = 1;
					
			else:
				scholarsMatrix[term_scholars[k]]={}
				scholarsMatrix[term_scholars[k]]['occ'] = 1;
				scholarsMatrix[term_scholars[k]]['cooc'] = {};

				for l in range(len(term_scholars)):
					if self.scholars.has_key(term_scholars[l]):
						if scholarsMatrix[term_scholars[k]]['cooc'].has_key(term_scholars[l]):
							scholarsMatrix[term_scholars[k]]['cooc'][term_scholars[l]] += 1
						else:
							scholarsMatrix[term_scholars[k]]['cooc'][term_scholars[l]] = 1;

		nodeId = "N::"+str(term)
		self.Graph.add_node(nodeId)
		'''
		$nodeId = 'N::' . $term['id'];
		$nodeLabel = str_replace('&', ' and ', $terms_array[$term['id']]['term']);
		$nodePositionY = rand(0, 100) / 100;
		$gexf .= '<node id="' . $nodeId . '" label="' . $nodeLabel . '">' . "\n";
		//$gexf .= '<viz:color b="19" g="'.max(0,180-(100*$terms_colors[$term['id']])).'"  r="244"/>' . "\n";
		$gexf .= '<viz:position x="' . (rand(0, 100) / 100) . '"    y="' . $nodePositionY . '"  z="0" />' . "\n";
		$gexf .= '<attvalues> <attvalue for="0" value="NGram"/>' . "\n";
		$gexf .= '<attvalue for="1" value="' . $terms_array[$term['id']]['occurrences'] . '"/>' . "\n";
		$gexf .= '<attvalue for="4" value="' . $terms_array[$term['id']]['occurrences'] . '"/>' . "\n";
		$gexf .= '</attvalues></node>' . "\n";

	     }
		'''

	for scholar in self.scholars:
		if scholar in scholarsMatrix:
			if len(scholarsMatrix[scholar]['cooc']) >= self.min_num_friends:
				scholarsIncluded += 1;
				nodeId = str(scholar);
				self.Graph.add_node(nodeId)
				'''
				$affiliation = '';
				//pt($scholar['last_name'].','.$scholar['css_voter'].','.$scholar['css_member']);
				//pt($color);
				//pt($content);
				if (is_utf8($nodeLabel)) {
				        $gexf .= '<node id="' . $nodeId . '" label="' . $nodeLabel . '">' . "\n";
					//$gexf .= '<viz:color b="'.(243-min(243,(200*$scholars_colors[$scholar['login']]))).'" g="183"  r="19"/>' . "\n";
					//$gexf .= '<viz:color '.$color.'/>' . "\n";
					$gexf .= '<viz:position x="' . (rand(0, 100) / 100) . '"    y="' . $nodePositionY . '"  z="0" />' . "\n";
					$gexf .= '<attvalues> <attvalue for="0" value="Document"/>' . "\n";
					if (true) {
						$gexf .= '<attvalue for="1" value="12"/>' . "\n";
						$gexf .= '<attvalue for="4" value="12"/>' . "\n";

					} else {
						$gexf .= '<attvalue for="1" value="10"/>' . "\n";
						$gexf .= '<attvalue for="4" value="10"/>' . "\n";

					}
					if (is_utf8($content)) {
						$gexf .= '<attvalue for="2" value="' . htmlspecialchars($content) . '"/>' . "\n";
					}
					$gexf .= '</attvalues></node>' . "\n";
				}
	
	$gexf .= '</nodes><edges>' . "\n";
	// écritude des liens
	$edgeid = 0;
				'''
	edgeid = 0
	for scholar in self.scholars:
		if scholar in scholarsMatrix:
			if len(scholarsMatrix[scholar]['cooc']) >= 1:
				for keyword in self.scholars[scholar]['keywords_ids']:
					if keyword:
						source= str(scholar)
						target="N::"+str(keyword)
						self.Graph.add_edge( source , target , {'weight':1,'type':"bipartite"})
						#Some bipartite relations are missing (just the 1%)

	for term in terms_array:
		nodeId1 = terms_array[term]['id'];
		if termsMatrix.has_key(str(nodeId1)):
			neighbors = termsMatrix[str(nodeId1)]['cooc'];
			for i, neigh in enumerate(neighbors):
				if neigh != str(term):					
					source="N::"+str(term)
					target="N::"+neigh
					weight=neighbors[str(neigh)]/float(terms_array[term]['occurrences'])
					self.Graph.add_edge( source , target , {'weight':weight,'type':"nodes2"})

	for scholar in self.scholars:
		nodeId1 = scholar;
		if scholarsMatrix.has_key(str(nodeId1)):
			neighbors=scholarsMatrix[str(nodeId1)]['cooc']; 
			for i, neigh in enumerate(neighbors):
				if neigh != str(scholar):				
					source=str(scholar)
					target=str(neigh)
					weight=self.jaccard(scholarsMatrix[nodeId1]['occ'],scholarsMatrix[neigh]['occ'],neighbors[str(neigh)])
					#print "\t"+source+","+target+" = "+str(weight)
					self.Graph.add_edge( source , target , {'weight':weight,'type':"nodes1"})


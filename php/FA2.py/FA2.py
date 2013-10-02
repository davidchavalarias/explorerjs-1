from Region import Region
import ForceFactory
import math

class ForceAtlas2:
	def __init__(self,graph):
		self.graph = graph
		self.p={
			"linLogMode": "false",
			"outboundAttractionDistribution": "false",
			"adjustSizes": "false",
			"edgeWeightInfluence": 0,
			"scalingRatio": 1,
			"strongGravityMode": "false",
			"gravity": 1,
			"jitterTolerance": 1,
			"barnesHutOptimize": "false",
			"barnesHutTheta": 1.2,
			"speed": 1,
			"outboundAttCompensation": 1,
			"totalSwinging": 0,
			"swingVSnode1": 0,
			"totalEffectiveTraction": 0,
			"complexIntervals": 500,
			"simpleIntervals": 1000
		}
		self.state = {"step": 0, "index": 0}
		self.rootRegion = 0

	def init(self):
		for i in range(len(self.graph["nodes"])):
			self.graph["nodes"][i]["fa2"] = {
				"mass": 1+self.graph["nodes"][i]["degree"],
				"old_dx": 0,
				"old_dy": 0,
				"dx": 0,
				"dy": 0
			}
		return self

	def go(self):
		while (self.atomicGo()):
			print "something"

	def atomicGo(self):
		graph = self.graph
		nodes = graph["nodes"]
		edges = graph["edges"]

		cInt = self.p["complexIntervals"]
		sInt = self.p["simpleIntervals"]
		
		case = self.state["step"]

		if   case==0:
								# Initialise layout data
			for i in range(len(nodes)):
				if nodes[i]["fa2"]:
					nodes[i]["fa2"]["mass"] = 1 + nodes[i]["degree"]
					nodes[i]["fa2"]["old_dx"] = nodes[i]["fa2"]["dx"]
					nodes[i]["fa2"]["old_dy"] = nodes[i]["fa2"]["dy"]
					nodes[i]["fa2"]["dx"] = 0
					nodes[i]["fa2"]["dy"] = 0
				else:
					nodes[i]["fa2"] = {
						"mass": 1 + nodes[i]["degree"],
						"old_dx": 0,
						"old_dy": 0,
						"dx": 0,
						"dy": 0
					}
				print nodes[i]["fa2"]
			
			# If Barnes Hut active, initialize root region
			if self.p["barnesHutOptimize"]:
				self.rootRegion = Region(nodes, 0)
				self.rootRegion.buildSubRegions()


			# If outboundAttractionDistribution active, compensate.
			if self.p["outboundAttractionDistribution"]:
				self.p["outboundAttCompensation"] = 0
				for i in range(len(nodes)):
					self.p["outboundAttCompensation"] += nodes[i]["fa2"]["mass"]
				self.p["outboundAttCompensation"] /= len(nodes)

			self.state["step"] = 1
			self.state["index"] = 0
			return True


		elif case==1:
								# Repulsion
			Repulsion = ForceFactory.buildRepulsion(self.p["adjustSizes"],self.p["scalingRatio"])
			if self.p["barnesHutOptimize"]:
				rootRegion = self.rootRegion
				barnesHutTheta = self.p["barnesHutTheta"]
				i = self.state["index"]
				while (i < len(nodes) and i < self.state["index"] + cInt):
					n = nodes[i]
					i+=1
					if n["fa2"]:
						rootRegion.applyForce(n, Repulsion, barnesHutTheta)
				if (i == len(nodes)):
					self.state["step"] = 2
					self.state["index"] = 0
				else:
					self.state["index"] = i
			else:
				i1 = self.state["index"]
				while (i1 < len(nodes) and i1 < self.state["index"] + cInt):
					n1 = nodes[i1]
					i1+=1
					if n1["fa2"]:
						for i2 in range(len(nodes)):
							if i2 < i1 and nodes[i2]["fa2"]:
								Repulsion.apply_nn(n1, nodes[i2])
				if (i1 == len(nodes)):
					self.state["step"] = 2
					self.state["index"] = 0
				else:
					self.state["index"] = i1
			return True


		elif case==2:
								# Gravity
			Gravity=""
			if self.p["strongGravityMode"]:
				Gravity = ForceFactory.getStrongGravity(self.p["scalingRatio"])
			else:
				Gravity = ForceFactory.buildRepulsion(self.p["adjustSizes"],self.p["scalingRatio"])
			gravity = self.p["gravity"]
			scalingRatio = self.p["scalingRatio"]
			i = self.state["index"]
			while (i < len(nodes) and i < self.state["index"] + sInt):
				n = nodes[i]
				i+=1
				if n["fa2"]:
					Gravity.apply_g(n, gravity / scalingRatio)

			if (i == len(nodes)):
				self.state["step"] = 3
				self.state["index"] = 0
			else:
				self.state["index"] = i
			return True

		elif case==3:
								# Attraction
			field=""
			if self.p["outboundAttractionDistribution"]:
				field = self.p["outboundAttCompensation"]
			else:
				field = 1
			Attraction = ForceFactory.buildAttraction(self.p["linLogMode"],self.p["outboundAttractionDistribution"],self.p["adjustSizes"],1*field)
			i = self.state["index"]
			if self.p["edgeWeightInfluence"] == 0:
				while (i < len(edges) and i < self.state["index"] + cInt):
					e = edges[i]
					i+=1
					Attraction.apply_nn(e["source"], e["target"], 1)
			elif self.p["edgeWeightInfluence"] == 1:
				while (i < len(edges) and i < self.state["index"] + cInt):
					e = edges[i]
					i+=1
					Attraction.apply_nn(e["source"], e["target"], (e["weight"] or 1))
			else:
				while (i < len(edges) and i < self.state["index"] + cInt):
					e = edges[i]
					i+=1
					Attraction.apply_nn(e["target"],(math.pow(e["weight"] or 1), self.p["edgeWeightInfluence"]))
			if (i == len(edges)):
				self.state["step"] = 4
				self.state["index"] = 0
			else:
				self.state["index"] = i
			return True

		elif case==4:
								# Auto adjust speed
			totalSwinging=0# How much irregular movement
			totalEffectiveTraction = 0  # Hom much useful movement
			swingingSum=0
			promdxdy=0
			for i in range(len(nodes)):
				n = nodes[i]
				fixed = n["fixed"] or False
				print fixed
				if not fixed and n["fa2"]:
					swinging = math.sqrt(math.pow(n["fa2"]["old_dx"] - n["fa2"]["dx"], 2)+math.pow(n["fa2"]["old_dy"] - n["fa2"]["dy"], 2))
					totalSwinging+=n["fa2"]["mass"]*swinging
					totalEffectiveTraction +=n["fa2"]["mass"]*0.5*math.sqrt(math.pow(n["fa2"]["old_dx"] + n["fa2"]["dx"], 2)+math.pow(n["fa2"]["old_dy"] + n["fa2"]["dy"], 2))
			self.p["totalSwinging"] = totalSwinging
			self.p["totalEffectiveTraction"] = totalEffectiveTraction
			#We want that swingingMovement < tolerance * convergenceMovement
			targetSpeed = math.pow(self.p["jitterTolerance"], 2)*self.p["totalEffectiveTraction"]/self.p["totalSwinging"]
			#But the speed shoudn't rise too much too quickly,
			#since it would make the convergence drop dramatically.
			maxRise = 0.5
			self.p["speed"] = self.p["speed"]+min(targetSpeed-self.p["speed"],maxRise * self.p["speed"])

			#Save old coordinates
			for i in range(len(nodes)):
				nodes[i]["old_x"] = +nodes[i]["x"]
				nodes[i]["old_y"] = +nodes[i]["y"]
			self.state["step"] = 5
			return True

		elif case==5:
								# Apply forces
			i = self.state["index"]
			if self.p["adjustSizes"]:
				speed = self.p["speed"]
				while (i < len(nodes) and i < self.state["index"] + sInt):
					n = nodes[i]
					i+=1
					fixed = n["fixed"] or False
					if not fixed and n["fa2"]:
						swinging = math.sqrt((n["fa2"]["old_dx"] - n["fa2"]["dx"])*(n["fa2"]["old_dx"] - n["fa2"]["dx"]) +(n["fa2"]["old_dy"] - n["fa2"]["dy"])*(n["fa2"]["old_dy"] - n["fa2"]["dy"]))
						factor = 0.1 * speed / (1 + speed * math.sqrt(swinging))
						df = math.sqrt(math.pow(n["fa2"]["dx"], 2)+math.pow(n["fa2"]["dy"], 2))
						factor = min(factor * df, 10) / df
						n["x"] += n["fa2"]["dx"] * factor
						n["y"] += n["fa2"]["dy"] * factor
			else:
				speed = self.p["speed"]
				while (i < len(nodes) and i < self.state["index"] + sInt):
					n = nodes[i]
					i+=1
					fixed = n["fixed"] or False
					if not fixed and n["fa2"]:
					#Adaptive auto-speed: the speed of each node is lowered
					#when the node swings.
						swinging = math.sqrt((n["fa2"]["old_dx"] - n["fa2"]["dx"])*(n["fa2"]["old_dx"] - n["fa2"]["dx"]) +(n["fa2"]["old_dy"] - n["fa2"]["dy"])*(n["fa2"]["old_dy"] - n["fa2"]["dy"]))
						factor = speed / (1 + speed * math.sqrt(swinging))
						n["x"] += n["fa2"]["dx"] * factor
						n["y"] += n["fa2"]["dy"] * factor
			if (i == len(edges)):
				self.state["step"] = 0
				self.state["index"] = 0
				return False
			else:
				self.state["index"] = i
				return True

		else:
								# Do the default
			print "Error"
			return False

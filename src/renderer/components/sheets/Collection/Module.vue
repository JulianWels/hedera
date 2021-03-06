<template>
	<div>
		<template v-if="moduleData">
			<div class="listMenu">
				<div class="sheetHeader">{{ $t(`info.modules.${config.i18nModuleTypes[moduleData.dependency_type]}`) }}</div>
				<hr>

				<div class="dist module">
					<h3>{{moduleData.sortkey}}</h3>
					<h2>{{moduleData.title}}</h2>
					<p>{{moduleData.desc}}</p>
				</div>
			</div>
			<buttons class="actionBar" :actions="actionButtons" />
			<div v-if="moduleData.node_type !== 0" class="listMenu bottomBar">
				<div class="dist">
					<div v-for="item in dependents" :key="item._id" class="moduleItem">
						<div class="icon"><typeBool /></div>
						<div class="info">
							<div class="top">{{item.title ? item.title : $t('state.untitled')}}</div>
							<div class="bottom">{{item.desc ? item.desc : $t('state.no_description')}}</div>
						</div>
					</div>
				</div>
				<div class="dist bottomAction center">
					<hr>
					<div class="top">Add Module</div>
					<buttons :actions="config.addModuleButtons" />
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import Buttons from '../../elements/Buttons'

import hModule from '../../../classes/Collection/Models/hModule'

import iconClose from '../../../assets/icons/outline-close-24px.svg'
import typeAnd from '../../../assets/icons/type_and.svg'
import typeBool from '../../../assets/icons/type_bool.svg'
import typeExclusive from '../../../assets/icons/type_exclusive.svg'

export default {
	name: 'module',
	props: ['sheet', 'data'],
	/**
	 * Data-Prop
	 * {string} data.path - full path of collection
	 * {array} [data.callOnMount] - methods that should be called after mount
	 * {string} data.callOnMount.name - method name
	 * {array} data.callOnMount.args - method arguments
	 */
	data: function () {
		let actionButtons = {
			left: [{
				icon: iconClose,
				callback: () => this.sheet.closeSelf(this.sheet)
			}],
			right: [
				{
					icon: typeBool,
					callback: () => {this.changeType_(0)}
				},
				{
					icon: typeAnd,
					callback: () => {this.changeType_(1)}
				},
				{
					icon: typeExclusive,
					callback: () => {this.changeType_(2)}
				},
			]
		}
		let addModuleButtons = {
			right: [
				{
					icon: typeBool,
					callback: () => {this.createSubModule_(0)}
				},
				{
					icon: typeAnd,
					callback: () => {this.createSubModule_(1)}
				},
				{
					icon: typeExclusive,
					callback: () => {this.createSubModule_(2)}
				},
				{
					label: 'Reusable Module',
					callback: () => {}
				},
			]
		}
		return {
			moduleData: undefined,
			dependents: [],
			config: {
				actionButtons,
				addModuleButtons,
				i18nModuleTypes: ['child', 'main', 'reuseable']
			},
		}
	},
	components: {
		Buttons,
		typeBool,
	},
	mounted: function() {
		this.updateModuleData_()

		this.data.collection.events.subscribe('modules', this.updateModuleData_)
	},
	beforeDestroy: function() {
		this.data.collection.events.unsubscribe('modules', this.updateModuleData_)
	},
	methods: {
		updateModuleData_: function() {
			this.data.collection.db.modules.get(this.data._id).then(res => {
				this.moduleData = res
				if (this.moduleData.node_type !== 0) this.updateDependents_()
			})
		},
		updateDependents_: function() {
			this.data.collection.db.modules.where('_id').anyOf(this.moduleData.children).toArray().then(res => {
				this.dependents = res
			})
		},
		changeType_: function(nr) {
			this.sheet.pushModal({
				title: 'Whoa there',
				desc: 'this is serious!',
				actions: {
					right: [{
						label: 'No',
						callback: ()=>{}
					},
					{
						label: 'Yes',
						class: 'danger',
						callback: ()=>{
							this.data.collection.apply(hModule.changeNodeType(this.moduleData, nr))
						}
					}],
				}
			})
		},
		createSubModule_: function(node_type) {
			this.data.collection.apply(hModule.create(0, this.moduleData, node_type))
		},
	},
	computed: {
		actionButtons: function() {
			let c = {...this.config.actionButtons}
			c.right[this.moduleData.node_type].class = 'selected'
			for (var i = c.right.length - 1; i >= 0; i--) {
				if (i === this.moduleData.node_type)
					c.right[i].class = 'selected'
				else delete c.right[i].class
			}
			return c
		}
	}
}
</script>

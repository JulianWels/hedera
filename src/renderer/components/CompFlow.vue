<template>
	<div ref="container" id="compFlow">
		<horizontalAnim>
			<div
				v-for="sheet in sheets"
				:key="sheet.nr"
				:class="['sheet', (sheet.nr===0)?'first':'child']"
				:ref="'s'+sheet.nr"
				:style="{ 'z-index': sheet.nr }"
			>
				<component :sheet="sheet" :ref="'c'+sheet.nr" :is="sheet.comp" :data="sheet.data" @compFlow="sheetCall($event)" />
			</div>
		</horizontalAnim>
		<modal v-if="modals.length > 0" :data="modals[modals.length-1]" @pop="popModal()" />
	</div>
</template>

<script>
import Vue from 'vue'
import VueScrollTo from 'vue-scrollto'
import debounce from 'debounce'

import horizontalAnim from './elements/HorizontalAnim'
import Modal from './elements/Modal'

import perfectChild from './sheets/PerfectChild'
import collectionOverview from './sheets/CollectionOverview'
import collection from './sheets/Collection'
import createCollection from './sheets/CreateCollection'
import settings from './sheets/Settings'
import module from './sheets/Collection/Module'

export default {
	name: 'compFlow',
	components: {
		horizontalAnim,
		Modal,

		perfectChild,
		collectionOverview,
		createCollection,
		collection,
		settings,
		module,
	},
	data: function () {
		// Settings for Vue-ScrollTo
		let scrollOptions = {
			container: '#compFlow',
			easing: [0.45, 0.05, 0.55, 0.95],
			offset: this._calculateOffset,
			force: true,
			cancelable: true,
			x: true,
			y: false,
		}

		return {
			focus: 0,
			modals: [],
			nextFocus: null,
			sheets: [],
			scrollOptions,
		}
	},
	mounted: function () {
		window.addEventListener('resize', debounce(this._scrollToFocus, 600))


		this._spawnNext('collection-overview', {})
		//this._spawnNext('collection', { path:'/Users/Julian/Documents/StGB.ivy' })
		this._spawnNext('settings')
	},
	methods: {
		/**
		 * Appends component as last child
		 * @param {string} comp - name of component to be opened
		 * @param {object} data - data to give to the child
		 */
		_spawnNext: function(comp, data) {
			let len = this.sheets.length
			this.sheets.splice(len, 0, {
				nr: len,
				comp: comp,
				data: data,
				get: this.getSheet,
				spawnChild: this.spawnChild,
				closeChild: this.closeChild,
				closeSelf: this.closeSelf,
				focusChild: this.focusChild,
				focusParent: this.focusParent,
				pushModal: this.pushModal,
				popModal: this.popModal,
			})
			this.focus = len
			Vue.nextTick(debounce(this._scrollToFocus, 50))
		},
		/**
		 * Calculates offset
		 * @return {Number} offset
		 */
		_calculateOffset: function() {
			let total = this.$refs.container.clientWidth
			let focus = this.$refs['c'+this.focus][0].$el.clientWidth
			return -((total/2)-(focus/2))
		},
		/**
		 * Closes all existing children and created new one
		 * @param {object} sheet - sheet that wants to create child
		 * @param {string} comp - name of component to be opened
		 * @param {object} data - data to give to the child
		 */
		spawnChild: function(sheet, comp, data) {
			let len = this.sheets.length
			let timeout = 0
			if (len > sheet.nr+1) {
				this.closeChild(sheet)
				timeout = 500
			}
			setTimeout(()=>{this._spawnNext(comp, data)}, timeout)
		},
		/**
		 * @param {number} sheet-nr
	 	 * @returns {object} Vue-Instance of sheet
		 */
		getSheet: function(nr) {
			if (this.$refs['c'+nr]) 
				return this.$refs['c'+nr][0]
			else
				return undefined
		},
		/**
		 * Closes given sheets child and all of it's children
		 * @param {object} sheet-object of the callee
		 */
		closeChild: function(sheet) {
			this.sheets.splice(sheet.nr+1)
			this.focusSheet(sheet.nr)
		},
		/**
		 * Closes given sheet and all children
		 * @param {object} sheet-object of the callee
		 */
		closeSelf: function(sheet) {
			this.sheets.splice(sheet.nr)
			this.focusSheet(sheet.nr-1)
		},
		/**
		 * Focus and scroll to child of sheet
		 * @param {object} sheet-object of the callee
		 */
		focusChild: function(sheet) {
			if (this.sheets.length > sheet.nr)
				this.focusSheet(sheet.nr+1)
		},
		/**
		 * Focus and scroll to parent of sheet
		 * @param {number} nr - sheet-nr to scroll to
		 */
		focusParent: function(sheet) {
			if (sheet.nr > 0)
				this.focusSheet(sheet.nr-1)
		},
		/**
		 * Focus and scroll to sheet
		 * @param {number} nr - sheet-nr to scroll to
		 */
		focusSheet: function(nr) {
			this.focus = nr
			this._scrollToFocus()
		},
		/**
		 * Adds a modal to the modal-stack
		 * @param {object} data - data required by one modal (see elements/Modal)
		 */
		pushModal: function(data) {
			this.modals.push(data)
		},
		/**
		 * Removes a modal to the modal-stack
		 */
		popModal: function() {
			this.modals.pop()
		},
		/**
		 * Callback for when horizontal-animation is finished
		 */
		_scrollToFocus: function() {
			VueScrollTo.scrollTo(this.$refs['s'+this.focus][0], 500, this.scrollOptions)
		}
	}
}
</script>

<style>

</style>

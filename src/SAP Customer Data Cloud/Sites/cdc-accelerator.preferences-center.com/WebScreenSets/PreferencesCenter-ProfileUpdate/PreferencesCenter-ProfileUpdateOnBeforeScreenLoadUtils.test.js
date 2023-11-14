import ProfileUpdateUtils from './PreferencesCenter-ProfileUpdateOnBeforeScreenLoadUtils'
import testData from './PreferencesCenter-ProfileUpdateOnBeforeScreenLoadUtils.testData'

describe('ProfileUpdateUtils: filterBlocklist()', () => {
    it('should filter subscriptions with RG', () => {
        const subscriptions = [{ key: 'felix_byEmail' }, { key: 'felix_byEmail_RG' }, { key: 'felix_byEmail_2' }]

        const filteredSubscriptions = ProfileUpdateUtils.filterBlocklist(subscriptions)

        expect(filteredSubscriptions).toHaveLength(2)
        expect(filteredSubscriptions).toEqual([{ key: 'felix_byEmail' }, { key: 'felix_byEmail_2' }])
    })

    it('should filter subscriptions in blocklist', () => {
        ProfileUpdateUtils.blocklist = ['felix_byEmail_2']

        const subscriptions = [{ key: 'felix_byEmail' }, { key: 'felix_byEmail_2' }, { key: 'felix_byEmail_3' }]

        const filteredSubscriptions = ProfileUpdateUtils.filterBlocklist(subscriptions)

        expect(filteredSubscriptions).toHaveLength(2)
        expect(filteredSubscriptions).toEqual([{ key: 'felix_byEmail' }, { key: 'felix_byEmail_3' }])
    })

    it('should return all subscriptions if no RG and no blocklist', () => {
        const subscriptions = [{ key: 'felix_byEmail' }, { key: 'felix_byEmail_2' }, { key: 'felix_byEmail_3' }]
        ProfileUpdateUtils.blocklist = []

        const filteredSubscriptions = ProfileUpdateUtils.filterBlocklist(subscriptions)

        expect(filteredSubscriptions).toHaveLength(3)
        expect(filteredSubscriptions).toEqual(subscriptions)
    })

    it('should return empty array if no subscriptions', () => {
        const subscriptions = []

        const filteredSubscriptions = ProfileUpdateUtils.filterBlocklist(subscriptions)

        expect(filteredSubscriptions).toHaveLength(0)
        expect(filteredSubscriptions).toEqual([])
    })
})

describe('ProfileUpdateUtils: groupSubscriptionsByBrand()', () => {
    it('should return empty array', () => {
        const result = ProfileUpdateUtils.groupSubscriptionsByBrand([])
        expect(result).toEqual([])
    })

    it('should return array with one brand', () => {
        const result = ProfileUpdateUtils.groupSubscriptionsByBrand([{ brandName: 'brand1' }])
        const expectedResult = [{ brandName: 'brand1', subscriptions: [{ brandName: 'brand1' }] }]
        expect(result).toEqual(expectedResult)
    })

    it('should return array with two brands', () => {
        const result = ProfileUpdateUtils.groupSubscriptionsByBrand([{ brandName: 'brand1' }, { brandName: 'brand2' }, { brandName: 'brand2' }])
        const expectedResult = [
            { brandName: 'brand1', subscriptions: [{ brandName: 'brand1' }] },
            {
                brandName: 'brand2',
                subscriptions: [{ brandName: 'brand2' }, { brandName: 'brand2' }],
            },
        ]
        expect(result).toEqual(expectedResult)
    })
})

describe('ProfileUpdateUtils: filterSubscribedBrands()', () => {
    it('should return an empty array if no subscribed subscriptions', () => {
        const groupedSubscriptions = [
            {
                brandName: 'brand1',
                subscriptions: [
                    { brandName: 'brand1', isSubscribed: false },
                    { brandName: 'brand1', isSubscribed: false },
                ],
            },
            {
                brandName: 'brand2',
                subscriptions: [
                    { brandName: 'brand2', isSubscribed: false },
                    { brandName: 'brand2', isSubscribed: false },
                ],
            },
        ]

        const filteredSubscriptions = ProfileUpdateUtils.filterSubscribedBrands(groupedSubscriptions)

        expect(filteredSubscriptions).toEqual([])
    })

    it('should return only brands where the user is registered', () => {
        const groupedSubscriptions = [
            {
                brandName: 'brand1',
                subscriptions: [
                    { brandName: 'brand1', isSubscribed: false, isUserRegistered: true },
                    { brandName: 'brand1', isSubscribed: false, isUserRegistered: true },
                ],
            },
            {
                brandName: 'brand2',
                subscriptions: [
                    { brandName: 'brand2', isSubscribed: false, isUserRegistered: false },
                    { brandName: 'brand2', isSubscribed: false, isUserRegistered: false },
                ],
            },
        ]

        const filteredSubscriptions = ProfileUpdateUtils.filterSubscribedBrands(groupedSubscriptions)

        expect(filteredSubscriptions).toEqual([
            {
                brandName: 'brand1',
                subscriptions: [
                    { brandName: 'brand1', isSubscribed: false, isUserRegistered: true },
                    { brandName: 'brand1', isSubscribed: false, isUserRegistered: true },
                ],
            },
        ])
    })
})

describe('ProfileUpdateUtils: moveNestleSubscriptionsToTop()', function () {
    it('should return an empty array if the input array is empty', function () {
        const input = []
        const output = ProfileUpdateUtils.moveNestleSubscriptionsToTop(input)
        expect(output).toEqual([])
    })

    it('should return the same array if there are no nestle subscriptions', function () {
        const input = [{ brandName: 'brand1' }, { brandName: 'brand2' }, { brandName: 'brand3' }]
        const output = ProfileUpdateUtils.moveNestleSubscriptionsToTop(input)
        expect(output).toEqual(input)
    })

    it('should return the same array if there are no other subscriptions', function () {
        const input = [{ brandName: 'nestle1' }, { brandName: 'nestle2' }, { brandName: 'nestlé' }]
        const output = ProfileUpdateUtils.moveNestleSubscriptionsToTop(input)
        expect(output).toEqual(input)
    })

    it('should move nestle subscriptions to the top of the input array', function () {
        const input = [{ brandName: 'nestle1' }, { brandName: 'brand1' }, { brandName: 'nestle2' }, { brandName: 'brand2' }, { brandName: 'nestlé' }, { brandName: 'brand3' }]
        const output = ProfileUpdateUtils.moveNestleSubscriptionsToTop(input)
        expect(output).toEqual([
            { brandName: 'nestle1' },
            { brandName: 'nestle2' },
            { brandName: 'nestlé' },
            { brandName: 'brand1' },
            { brandName: 'brand2' },
            { brandName: 'brand3' },
        ])
    })
})

describe('ProfileUpdateUtils: getSubscriptionFromDescription()', function () {
    it('should return empty subscription when no description', () => {
        const subscription = ProfileUpdateUtils.getSubscriptionFromDescription()
        expect(subscription).toEqual({ brandName: '', description: '' })
    })

    it('should return empty subscription when description is empty', () => {
        const subscription = ProfileUpdateUtils.getSubscriptionFromDescription('')
        expect(subscription).toEqual({ brandName: '', description: '' })
    })

    it('should return empty subscription when description is not in the correct format', () => {
        const subscription = ProfileUpdateUtils.getSubscriptionFromDescription('brandName')
        expect(subscription).toEqual({ brandName: '', description: '' })
    })

    it('should return subscription when description is in the correct format', () => {
        const subscription = ProfileUpdateUtils.getSubscriptionFromDescription('brandName::description')
        expect(subscription).toEqual({ brandName: 'brandName', description: 'description' })
    })
})

describe('ProfileUpdateUtils: getGroupedSubscriptionList()', function () {
    it('should return empty array when no valid arguments', () => {
        const groupedSubscriptions = ProfileUpdateUtils.getGroupedSubscriptionList({})
        expect(groupedSubscriptions).toEqual([])
    })

    it('should return empty array when no subscriptions', () => {
        const groupedSubscriptions = ProfileUpdateUtils.getGroupedSubscriptionList({
            schemaSubscriptions: [],
            userSubscriptions: [],
        })
        expect(groupedSubscriptions).toEqual([])
    })

    it('should return ignore subscriptions with incorrect description', () => {
        const schemaSubscriptions = {
            felix_byEmail: { email: { description: 'Felix::I want to receive Felix news by email' } },
            nescafe_bySMS: { email: { description: 'Incorrect description' } },
            // nescafe_bySMS: { email: { description: 'Nescafe::I want to receive Nescafe news by sms' } },
        }
        const userSubscriptions = {
            felix_byEmail: { email: { isSubscribed: true, isUserRegistered: true } },
            nescafe_bySMS: { email: { isSubscribed: true, isUserRegistered: true } },
        }
        const expectedGroupedSubscriptions = [
            {
                brandName: 'Felix',
                subscriptions: [{ key: 'felix_byEmail', brandName: 'Felix', description: 'I want to receive Felix news by email', isSubscribed: true, isUserRegistered: true }],
            },
        ]
        const groupedSubscriptions = ProfileUpdateUtils.getGroupedSubscriptionList({ schemaSubscriptions, userSubscriptions })
        expect(groupedSubscriptions).toEqual(expectedGroupedSubscriptions)
    })

    it('should return grouped subscriptions in correct order', () => {
        const groupedSubscriptions = ProfileUpdateUtils.getGroupedSubscriptionList({
            schemaSubscriptions: testData.schemaSubscriptions,
            userSubscriptions: testData.userSubscriptions,
        })

        console.log(groupedSubscriptions[2])

        expect(groupedSubscriptions).toEqual(testData.groupedSubscriptions)
    })
})

describe('ProfileUpdateUtils: setAttributes()', function () {
    it('should add attributes to an html element', () => {
        let checkbox = document.createElement('input')
        const attributes = {
            class: 'preferences-center-subscription-checkbox toggle-checkbox',
            type: 'checkbox',
            name: 'subscriptions.subscriptionName.email.isSubscribed',
        }
        ProfileUpdateUtils.setAttributes(checkbox, attributes)
        Object.entries(attributes).forEach(([key, value]) => {
            expect(checkbox.getAttribute(key)).toEqual(value)
        })
    })
})

describe('ProfileUpdateUtils: createSubscriptionHeader()', function () {
    it('should create the correct html element', () => {
        let container = document.createElement('div')
        ProfileUpdateUtils.createSubscriptionHeader({ text: 'testBrand', container })
        expect(container.innerHTML).toEqual(testData.subscriptionHeaderHTML)
    })
})

describe('ProfileUpdateUtils: createSubscriptionField()', function () {
    it('should create the correct html element', () => {
        let container = document.createElement('div')
        ProfileUpdateUtils.createSubscriptionField({ key: 'testKey', description: 'testDescription', container })
        expect(container.innerHTML).toEqual(testData.subscriptionFieldHTML)
    })
})

describe('ProfileUpdateUtils: createSubscriptionList()', function () {
    let container = document.createElement('div')

    it('should create the correct html element', () => {
        ProfileUpdateUtils.createSubscriptionList({ groupedSubscriptions: testData.groupedSubscriptions, container })
        expect(container.innerHTML).toEqual(testData.subscriptionListHTML)
    })

    it('should not load again if already loaded', () => {
        ProfileUpdateUtils.createSubscriptionList({ groupedSubscriptions: testData.groupedSubscriptions, container })
        expect(container.innerHTML).toEqual(testData.subscriptionListHTML)
    })
})
